#!/usr/bin/env node

import { createRootCommand } from '../dist/bin.js';
import { logError } from '../dist/log.js';

const command = createRootCommand();

command.parseAsync(process.argv).catch((error) => {
  logError(error);
  process.exitCode = 999999;
});
