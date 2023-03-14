import * as util from 'node:util';
import chalk from 'chalk';

export type LogFn = (...formatArgs: Parameters<typeof util.format>) => void;

export function logSuccess(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.green(util.format(...formatArgs))}\n`);
}

export function logError(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.red(util.format(...formatArgs))}\n`);
}

export function logInfo(...formatArgs: Parameters<typeof util.format>) {
  process.stdout.write(`${chalk.blue(util.format(...formatArgs))}\n`);
}

export function logWithTimestamp(
  logLineOrLines: (Parameters<typeof util.format> | string)[] | string,
  logFunction: LogFn = logInfo,
  dateTime: Date = new Date(),
) {
  const timestamp = dateTime.toISOString();
  const logLines = Array.isArray(logLineOrLines) ? logLineOrLines : [logLineOrLines];
  const processedLines = logLines.map((line) =>
    typeof line === 'string' ? line : util.format(...line),
  );
  const [firstLine, ...middleLines] = processedLines;
  const firstLineSeparator = middleLines.length > 0 ? '⎡' : '[';
  const lastLine = middleLines.pop();
  const timestampPrefix = `| ${timestamp} `;
  logFunction(`${timestampPrefix}${firstLineSeparator} ${firstLine}`);
  const padding = ' '.repeat(timestampPrefix.length - 1);
  for (const line of middleLines) {
    logFunction(`|${padding}| ${line})`);
  }
  if (lastLine) {
    logFunction(`|${padding}⎣ ${lastLine}`);
  }
}

export function logSuccessWithTimestamp(
  logLineOrLines: (Parameters<typeof util.format> | string)[] | string,
  dateTime: Date = new Date(),
) {
  logWithTimestamp(logLineOrLines, logSuccess, dateTime);
}

export function logErrorWithTimestamp(
  logLineOrLines: (Parameters<typeof util.format> | string)[] | string,
  dateTime: Date = new Date(),
) {
  logWithTimestamp(logLineOrLines, logError, dateTime);
}
