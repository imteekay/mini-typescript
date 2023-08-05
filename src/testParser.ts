import * as fs from 'fs';
import { Node } from './types';
import { parse } from './parse';
import { lex } from './lex';

const args = process.argv.slice(2);
const file = args[0];

if (!file) {
  console.log('Missing test file');
  process.exit();
}

function display(o: any) {
  const o2 = {} as any;
  for (const k in o) {
    if (k === 'pos') continue;
    else if (k === 'kind') o2[k] = Node[o.kind];
    else if (typeof o[k] === 'object') o2[k] = display(o[k]);
    else o2[k] = o[k];
  }
  return o2;
}

console.log(
  JSON.stringify(
    display(parse(lex(fs.readFileSync('tests/' + file, 'utf8')))),
    null,
    2,
  ),
);
