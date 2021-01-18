#!/usr/bin/env node

import * as program from 'commander';
import * as fs from 'fs';
import * as path from 'path';

import {Options, ScrabbleCheater} from './';

const defaultPackageJsonPath = path.join(__dirname, 'package.json');
const packageJsonPath = fs.existsSync(defaultPackageJsonPath)
  ? defaultPackageJsonPath
  : path.join(__dirname, '../package.json');

const {bin, description, version} = require(packageJsonPath);

program
  .name(Object.keys(bin)[0])
  .version(version)
  .description(description)
  .option('-w, --wordlist <file>', 'Specify a wordlist file (mandatory)')
  .option('-l, --letters <letters>', 'Specify letters')
  .option('-q, --quiet', 'Quiet mode: displays only the letters')
  .option('-m, --maximum <number>', 'Specify a maximum of results')
  .option('-s, --single', 'Single word mode: displays each word and copies it to the clipboard')
  .parse(process.argv);

const commanderOptions = program.opts();

if (!commanderOptions.wordlist) {
  console.error('  Error: no wordlist file specified.');
  program.help();
}

if (commanderOptions.maximum && !parseInt(commanderOptions.maximum, 10)) {
  console.error('  Error: invalid maximum number specified.');
  program.help();
}

const options: Options = {
  ...(commanderOptions.letters && {letters: commanderOptions.letters}),
  ...(commanderOptions.maximum && {maximum: commanderOptions.maximum}),
  ...(commanderOptions.quiet && {quiet: commanderOptions.quiet}),
  ...(commanderOptions.single && {single: commanderOptions.single}),
};

void (async () => {
  try {
    const matches = await new ScrabbleCheater(commanderOptions.wordlist, options).start();
    if (matches.length && !commanderOptions.single) {
      console.info(matches.join('\n'));
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
