# ScrabbleCheater ![Travis CI](https://api.travis-ci.org/ffflorian/scrabble-cheater.svg?branch=master) [![Greenkeeper badge](https://badges.greenkeeper.io/ffflorian/scrabble-cheater.svg)](https://greenkeeper.io/)
This is a simple Scrabble cheating tool designed for Andy's [scrabble-bot](https://github.com/AndyLnd/scrabble-bot) (but can be used for a normal Scrabble game, too).

Of course you shouldn't be using this and I'm not responsible if people call you a cheater.

## Setup
```
yarn
yarn dist
```

## Run
```
./bin/scrabble-cheater
```

## Usage
```
  Usage: scrabble-cheater [options]

  A simple Scrabble cheating tool


  Options:

    -V, --version            output the version number
    -w, --wordlist <file>    Specify a wordlist file (mandatory)
    -m, --maximum <number>   Specify a maximum of results
    -l, --letters <letters>  Specify letters
    -q, --quiet              Quiet mode: displays only the letters
    -s, --single             Single word mode: displays each word and copies it to the clipboard
    -h, --help               output usage information
```

## Include in your project
```ts
import ScrabbleCheater from 'scrabble-cheater';

new ScrabbleCheater('./my-wordlist.txt', 'l e t t e r s')
  .start()
  .then(matches => {
    console.log(matches); // [ 'match1', 'match2', ... ]
  });
```
