import * as path from 'path';
import * as fs from 'fs';
import * as readline from 'readline';

export default class ScrabbleCheater {
  private words: Array<string> = [];

  constructor(private wordListPath: string) {}

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
      .then(letters => this.findMatches(letters));
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
      this.words = wordList
        .split('\n')
        .filter(value => regex.test(value));

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
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question('Letters? ', input => {
        const letters = input.replace(/[^A-Za-z]/g, '').toLowerCase();
        if (letters) {
          resolve(letters);
        } else {
          reject('No letters entered.');
        }
        rl.close();
      });
    });
  }
}
