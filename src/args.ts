import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface GitArgs {
  gitUserName?: string;
  gitUserEmail?: string;
  gitSigningKey?: string;
}

export interface Args extends GitArgs {
  projectDir: string;
  newContentDir: string;
}

export async function getArgs(): Promise<Args> {
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
    .option("gitUserName", {
      type: "string",
      description: "Git user.name to set for the repositories.",
      requiresArg: true,
    })
    .option("gitUserEmail", {
      type: "string",
      description: "Git user.email to set for the repositories.",
      requiresArg: true,
    })
    .option("gitSigningKey", {
      type: "string",
      description:
        "Git uer.signingkey to set for the repositories. If specified, signing will be enforced for the repositories as well.",
      requiresArg: true,
    })
    .help()
    .parse();
}
