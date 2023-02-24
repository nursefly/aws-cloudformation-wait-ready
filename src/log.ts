import * as util from 'node:util';
import chalk from 'chalk';

export function logSuccess(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.green(util.format(...formatArgs))}\n`);
}

export function logError(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.red(util.format(...formatArgs))}\n`);
}

export function logInfo(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.blue(util.format(...formatArgs))}\n`);
}
