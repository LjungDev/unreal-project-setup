import { runCmd } from "./cmd.js";

export async function git(command: string, cwd: string): Promise<string> {
  return runCmd(`git ${command}`, cwd);
}
