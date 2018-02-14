import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

export default class ScrabbleCheater {
  private words: Array<string> = [];

  constructor(private wordListPath: string) {}

  public start() {
    return this.loadWords()
      .then(() => {
        console.info(`${this.words.length} words loaded.`);
        return this.readLineAsync();
      })
      .then(letters => this.findMatches(letters))
  }

  private readLineAsync(): Promise<string> {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Letters? ', input => {
        const letters = input.replace(/[^A-Za-z]/g, '').toLowerCase();
        if (letters) {
          resolve(letters);
        } else {
          reject('No letters entered');
        }
        rl.close();
      });
    });
  }

  private findMatches(letters: string): Array<string> {
    const regex = new RegExp(`^[${letters}]+$`);

    const matches = this.words
      .reduce((accumulator: Array<string>, currentValue) => {
        if (regex.test(currentValue)) accumulator.push(currentValue);
        return accumulator;
      }, [])
      .sort((a, b) => b.length - a.length);

    return matches;
  }

  private loadWords() {
    return this.readFileAsync(this.wordListPath).then(wordList => (this.words = wordList.split('\n')));
  }

  private readFileAsync(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.toString());
        }
      });
    });
  }
}
