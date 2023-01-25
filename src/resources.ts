import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";

export default class Resources {
  static resDir: string | undefined = undefined;

  static getResDir(): string {
    if (!this.resDir) {
      this.resDir = path.join(
        path.parse(fileURLToPath(import.meta.url)).dir,
        "../res"
      );
    }
    return this.resDir;
  }

  static async copyFile(file: string, destinationDir: string): Promise<void> {
    const filePath = path.join(this.getResDir(), file);
    const destinationPath = path.join(destinationDir, file);
    await fs.copyFile(filePath, destinationPath);
  }

  static async editAndCopyFile(
    file: string,
    destinationDir: string,
    fileContentVisitor: (contents: string) => Promise<string> | string
  ): Promise<void> {
    const filePath = path.join(this.getResDir(), file);
    const destinationPath = path.join(destinationDir, file);

    const contents = await fs.readFile(filePath, { encoding: "utf-8" });
    const editedContents = await fileContentVisitor(contents);

    await fs.writeFile(destinationPath, editedContents, { encoding: "utf-8" });
  }
}
