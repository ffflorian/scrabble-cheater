#!/usr/bin/env node

import program = require('commander');
import {Options, ScrabbleCheater} from './';

const {description, name, version}: {description: string; name: string; version: string} = require('../package.json');

program
  .name(name)
  .version(version)
  .description(description)
  .option('-w, --wordlist <file>', 'Specify a wordlist file (mandatory)')
  .option('-l, --letters <letters>', 'Specify letters')
  .option('-q, --quiet', 'Quiet mode: displays only the letters')
  .option('-m, --maximum <number>', 'Specify a maximum of results')
  .option('-s, --single', 'Single word mode: displays each word and copies it to the clipboard')
  .parse(process.argv);

if (!program.wordlist) {
  console.error('  Error: no wordlist file specified.');
  program.help();
}

if (program.maximum && !parseInt(program.maximum, 10)) {
  console.error('  Error: invalid maximum number specified.');
  program.help();
}

const options: Options = {
  ...(program.letters && {letters: program.letters}),
  ...(program.maximum && {maximum: program.maximum}),
  ...(program.quiet && {quiet: program.quiet}),
  ...(program.single && {single: program.single}),
};

new ScrabbleCheater(program.wordlist, options)
  .start()
  .then(matches => {
    if (matches.length && !program.single) {
      console.log(matches.join('\n'));
    }
  })
  .catch(err => console.error('Error:', err));
