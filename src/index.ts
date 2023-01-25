import path from "node:path";
import { exit } from "node:process";

import fs from "fs-extra";
import yargs from "yargs";
import chalk from "chalk";
import inquirer from "inquirer";
import { hideBin } from "yargs/helpers";

import { git } from "./git.js";
import Resources from "./resources.js";
import { endStatusLine, startStatusLine } from "./statusLine.js";
import dayjs from "dayjs";

interface Args {
  projectDir: string;
  newContentDir: string;
}

interface ProjectInfo {
  projectRoot: string;
  projectName: string;
  initialContentDir: string;
  newProjectDir: string;
  newContentDir: string;
}

async function getArgs(): Promise<Args> {
  return yargs(hideBin(process.argv))
    .option("projectDir", {
      type: "string",
      description:
        "Location of the Unreal project, e.g. D:\\GameDev\\MyProject. This location should contain the *.uproject file.",
      requiresArg: true,
      demandOption: true,
    })
    .option("newContentDir", {
      type: "string",
      description:
        "Location to move Contents to, e.g. E:\\NAS\\GameDev\\MyProject_Assets.",
      requiresArg: true,
      demandOption: true,
    })
    .help()
    .parse();
}

async function verifyArgs(
  projectDir: string,
  newContentDir: string
): Promise<void> {
  const projectDirExists = await fs.exists(projectDir);

  if (!projectDirExists) {
    throw new Error(`Project dir '${projectDir}' does not exist`);
  }

  const projectDirFiles = await fs.readdir(projectDir);
  const uprojectFile = projectDirFiles.find(
    (file) => path.parse(file).ext === ".uproject"
  );

  if (!uprojectFile) {
    throw new Error(
      `Unable to find .uproject file (is the project dir correct?). Found files: ${projectDirFiles.join(
        ", "
      )}`
    );
  }

  const newContentDirExists = await fs.exists(newContentDir);

  if (newContentDirExists) {
    throw new Error(`New Content dir '${newContentDir}' already exists`);
  }

  const newContentDirRoot = path.parse(newContentDir).dir;
  const newContentDirRootExists = await fs.exists(newContentDirRoot);

  if (!newContentDirRootExists) {
    throw new Error(
      `New Content dir parent dir '${newContentDirRoot}' does not exists`
    );
  }
}

async function collectProjectInfo(
  projectDir: string,
  newContentDir: string
): Promise<ProjectInfo> {
  const projectFiles = await fs.readdir(projectDir);
  const uprojectFile = projectFiles.find((file) => file.endsWith(".uproject"));
  const projectName = path.parse(uprojectFile ?? "").name;

  return {
    projectRoot: projectDir,
    projectName,
    initialContentDir: path.join(projectDir, "Content"),
    newProjectDir: path.join(projectDir, projectName),
    newContentDir,
  };
}

async function askToContinue(projectInfo: ProjectInfo): Promise<void> {
  console.log("Project name:", projectInfo.projectName);
  console.log("New Content location:", projectInfo.newContentDir);
  console.log("New Project location:", projectInfo.newProjectDir);

  console.log(
    `\n${chalk.bold(
      "NOTE"
    )}: make sure to run this command as the user intended to run future git commands, otherwise you might end up with "dubious ownership" issues.\n`
  );

  const answer = await inquirer.prompt([
    {
      type: "confirm",
      name: "continue",
      message: "Continue?",
      default: false,
    },
  ]);

  if (answer.continue !== true) {
    console.log("Exiting");
    exit();
  }
}

async function setupContentDir(
  initialContentDir: string,
  newContentDir: string
): Promise<void> {
  startStatusLine("Setting up Content dir");

  await git("init", initialContentDir);
  await git("branch -m master main", initialContentDir);
  await git(
    "config --local receive.denyCurrentBranch updateInstead",
    initialContentDir
  );
  await git("lfs install", initialContentDir);
  await git('lfs track "*.uasset"', initialContentDir);
  await git('lfs track "*.umap"', initialContentDir);
  await git('lfs track "*.blend"', initialContentDir);
  await git('lfs track "*.fbx"', initialContentDir);
  await git('lfs track "*.png"', initialContentDir);
  await git('lfs track "*.tga"', initialContentDir);
  await git('lfs track "*.wav"', initialContentDir);
  await git('lfs track "*.mp3"', initialContentDir);
  await git("add .gitattributes", initialContentDir);
  await git('commit -m "🎉 Init: setup"', initialContentDir);

  const filesToCommit = (await git("status --porcelain", initialContentDir))
    .split("\n")
    .filter(Boolean);

  if (filesToCommit.length > 0) {
    await git("add *", initialContentDir);
    await git('commit -m "🍱 Assets: add initial asset"', initialContentDir);
  }

  await fs.ensureDir(path.parse(newContentDir).root);
  await fs.move(initialContentDir, newContentDir);

  endStatusLine();
}

function replaceTextPlaceholders(
  { projectName, gitUserName }: { projectName: string; gitUserName: string },
  readmeContents: string
): string {
  return readmeContents
    .replace(/{projectName}/g, projectName)
    .replace(/{userName}/g, gitUserName)
    .replace(/{currentYear}/g, dayjs().format("YYYY"));
}

async function setupProjectDir(
  initialProjectDir: string,
  newProjectDir: string,
  contentDir: string,
  projectName: string
): Promise<void> {
  startStatusLine("Setting up Project dir");

  const projectFiles = await fs.readdir(initialProjectDir);
  const relativeNewProjectPath = path.relative(
    initialProjectDir,
    newProjectDir
  );
  const contentPath = path.join(relativeNewProjectPath, "Content");
  const fullContentPath = path.join(initialProjectDir, contentPath);

  await fs.ensureDir(newProjectDir);
  await Promise.all(
    projectFiles.map((file) =>
      fs.move(
        path.join(initialProjectDir, file),
        path.join(newProjectDir, file)
      )
    )
  );

  const gitUserName = (await git("config user.name", initialProjectDir)).trim();

  await Resources.copyFile(".gitignore", newProjectDir);

  const replaceTextWithProjectInfo = (contents: string) =>
    replaceTextPlaceholders({ projectName, gitUserName }, contents);

  await Resources.editAndCopyFile(
    "README.md",
    initialProjectDir,
    replaceTextWithProjectInfo
  );

  await Resources.editAndCopyFile(
    "LICENSE",
    initialProjectDir,
    replaceTextWithProjectInfo
  );

  await git("init", initialProjectDir);
  await git("branch -m master main", initialProjectDir);
  await git(
    `-c protocol.file.allow=always submodule add -b main ${contentDir} ${contentPath}`,
    initialProjectDir
  );
  await git("config push.recurseSubmodules on-demand", initialProjectDir);

  await git("config protocol.file.allow always", fullContentPath);
  await git("checkout main", fullContentPath);
  await git("-c protocol.file.allow=always pull", fullContentPath);
  await git("add *", initialProjectDir);

  endStatusLine();
}

async function main(): Promise<void> {
  const args = await getArgs();

  await verifyArgs(args.projectDir, args.newContentDir);

  const projectInfo = await collectProjectInfo(
    args.projectDir,
    args.newContentDir
  );

  await askToContinue(projectInfo);

  await setupContentDir(
    projectInfo.initialContentDir,
    projectInfo.newContentDir
  );

  await setupProjectDir(
    projectInfo.projectRoot,
    projectInfo.newProjectDir,
    projectInfo.newContentDir,
    projectInfo.projectName
  );

  console.log("\nDone! 🥳 Game Dev time❗ 🚀");
}

main();
