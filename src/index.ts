import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as clipboard from 'clipboardy';

export default class ScrabbleCheater {
  private dictionary: Array<string> = [];

  constructor(private wordListPath: string, private maximum = 0, private singleMode?: boolean, private letters?: string) {}

  public start(): Promise<Array<string>> {
    return this.loadWords()
      .then(length => {
        if (length) {
          console.info(`${length} word${length > 1 ? 's' : ''} loaded.`);
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
        process.stdout.write(`${matches.length} matches found`);

        if (this.maximum) {
          process.stdout.write(`, ${this.singleMode ? 'sending' : 'displaying'} the first ${this.maximum}`);
          matches = matches.slice(0, this.maximum);
        }

        process.stdout.write('.\n');

        if (this.singleMode) {
          this.singleOutput(matches);
        }
        return matches;
      });
  }

  private findMatches(letters: string): Array<string> {
    const regex = new RegExp(`^[${letters}]+\$`);

    return this.dictionary
      .filter(value => regex.test(value))
      .sort((a, b) => b.length - a.length);
  }

  private formatLetters(letters: string): string {
    const regex = new RegExp('[^A-Za-z]');
    return letters.replace(regex, '').toLowerCase();
  }

  private loadWords(): Promise<number> {
    const regex = new RegExp('^[A-Za-z]+$', 'g');

    return this.readFileAsync(this.wordListPath).then(wordList => {
      this.dictionary = wordList.split('\n').filter(value => regex.test(value));
      return this.dictionary.length;
    });
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
        output: process.stdout
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

  private singleOutput(matches: Array<string>): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    let counter = 0;

    console.log();

    const next = () => {
      console.log(matches[counter]);
      clipboard.writeSync(matches[counter]);
      if (counter < matches.length - 1) {
        console.log('Press Enter for the next word ...');
        counter++;
      } else {
        return rl.close();
      }
    };

    rl.on('line', next);

    next();
  }
}
