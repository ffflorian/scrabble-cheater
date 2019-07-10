//tslint:disable:no-default-export

import * as clipboard from 'clipboardy';
import * as fs from 'fs';
import * as readline from 'readline';

export default class ScrabbleCheater {
  private dictionary: string[] = [];

  constructor(
    private readonly wordListPath: string,
    private letters?: string,
    private readonly quietMode = false,
    private readonly maximum = 0,
    private readonly singleMode = false
  ) {}

  public start(): Promise<string[]> {
    return this.loadWords()
      .then(length => {
        if (length) {
          this.log(`${length} word${length > 1 ? 's' : ''} loaded.`);
        } else {
          return Promise.reject('No words loaded. Wordlist file corrupt?');
        }
        if (this.letters) {
          return this.formatLetters(this.letters);
        }
        return this.readLineAsync();
      })
      .then(letters => {
        let matches = this.findMatches(letters);
        this.log(`ScrabbleCheater: ${matches.length} matches found`, true);

        if (this.maximum) {
          this.log(`, ${this.singleMode ? 'sending' : 'displaying'} the first ${this.maximum}`, true);
          matches = matches.slice(0, this.maximum);
        }

        this.log('.\n\n', true);

        if (this.singleMode) {
          this.singleOutput(matches);
        }
        return matches;
      });
  }

  public setLetters(letters: string): Promise<ScrabbleCheater> {
    this.letters = letters;
    return Promise.resolve(this);
  }

  private findMatches(letters: string): string[] {
    const regex = new RegExp(`^[${letters}]+\$`);

    return this.dictionary.filter((value, index) => regex.test(value)).sort((a, b) => b.length - a.length);
  }

  private formatLetters(letters: string): string {
    const regex = new RegExp('[^A-Za-z]');
    return letters.replace(regex, '').toLowerCase();
  }

  private loadWords(): Promise<number> {
    const regex = new RegExp('^[A-Za-z]+$');

    return this.readFileAsync(this.wordListPath).then(wordList => {
      this.dictionary = wordList.split('\n').filter(value => regex.test(value));
      return this.dictionary.length;
    });
  }

  private log(message: string, raw = false): void {
    if (!this.quietMode) {
      if (!raw) {
        console.info(`ScrabbleCheater: ${message}`);
      } else {
        process.stdout.write(message);
      }
    }
  }

  private readFileAsync(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, data) => {
        if (!error) {
          resolve(data.toString());
        } else {
          reject(error.message);
        }
      });
    });
  }

  private readLineAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Letters? ', input => {
        const letters = this.formatLetters(input);
        if (letters) {
          resolve(letters);
        } else {
          reject('No letters entered.');
        }
        rl.close();
      });
    });
  }

  private singleOutput(matches: string[]): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let counter = 0;

    const next = () => {
      console.log(matches[counter]);
      clipboard.writeSync(matches[counter]);
      if (counter < matches.length - 1) {
        this.log('Press Enter to copy the next word...');
        counter++;
      } else {
        return rl.close();
      }
    };

    rl.on('line', next);

    next();
  }
}
