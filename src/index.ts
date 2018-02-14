import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';
import * as clipboard from 'clipboardy';

export default class ScrabbleCheater {
  private words: Array<string> = [];

  constructor(private wordListPath: string, private singleMode?: boolean) {}

  public start(): Promise<Array<string>> {
    return this.loadWords()
      .then(count => {
        if (count) {
          console.info(`${count} word${count > 1 ? 's' : ''} loaded.`);
        } else {
          return Promise.reject('No words loaded. Wordlist file corrupt?');
        }
        return this.readLineAsync();
      })
      .then(letters => {
        const matches = this.findMatches(letters);
        console.log(`${matches.length} matches found.`);

        if (this.singleMode) {
          this.singleOutput(matches);
        }
        return matches;
      });
  }

  private findMatches(letters: string): Array<string> {
    const regex = new RegExp(`^[${letters}]+\$`);

    return this.words
      .filter(value => regex.test(value))
      .sort((a, b) => b.length - a.length);
  }

  private loadWords(): Promise<number> {
    const regex = new RegExp('^[A-Za-z]+$', 'g');

    return this.readFileAsync(this.wordListPath).then(wordList => {
      this.words = wordList.split('\n').filter(value => regex.test(value));

      return this.words.length;
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
    const regex = new RegExp('[^A-Za-z]');

    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Letters? ', input => {
        const letters = input.replace(regex, '').toLowerCase();
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
