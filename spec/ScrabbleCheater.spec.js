//@ts-check

const { default: ScrabbleCheater } = require('../dist/');
const path = require('path');
const wordList = path.resolve(__dirname, 'wordlist.txt');
const emptyList = path.resolve(__dirname, 'empty.txt');

describe('ScrabbleCheater', () => {
  it('finds all words', done => {
    const sc = new ScrabbleCheater(wordList, true, 'her');
    sc
      .start()
      .then(matches => {
        expect(matches.includes('here')).toBe(true);
        expect(matches.includes('her')).toBe(true);
        expect(matches.includes('he')).toBe(true);
        done();
      })
      .catch(done.fail);
  });

  it(`Doesn't accept an empty file`, done => {
    const sc = new ScrabbleCheater(emptyList, true);
    sc
      .start()
      .then(() => done.fail())
      .catch(() => done());
  });
});
