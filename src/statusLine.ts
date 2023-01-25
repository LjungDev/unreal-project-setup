import chalk from "chalk";

export function startStatusLine(title: string): void {
  process.stdout.write(`${title}...`);
}

export function endStatusLine(): void {
  console.log(chalk.green("Ok ✔"));
}
