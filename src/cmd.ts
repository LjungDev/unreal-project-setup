import { exit } from "node:process";
import { exec } from "node:child_process";

export async function runCmd(command: string, cwd: string): Promise<string> {
  return new Promise((resolve) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command error: ${command}`);
        console.error(error);
        console.error("stdout:");
        console.error(stdout);
        console.error("stderr:");
        console.error(stderr);
        exit(-1);
      } else {
        resolve(stdout);
      }
    });
  });
}
