import * as fs from 'fs';
import { parse } from './parse';
import { lex } from './lex';
import { bind } from './bind';
import { check } from './check';
import { errors } from './error';

const args = process.argv.slice(2);
const file = args[0];

if (!file) {
  console.log('Missing test file');
  process.exit();
}

const tree = parse(lex(fs.readFileSync('tests/' + file, 'utf8')));

bind(tree);
check(tree);

for (let [key, value] of errors.entries()) {
  console.log(key, value);
}
