import * as fs from 'fs';
import { Module, Node, Table } from './types';
import { compile } from './compile';

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

function displayTable(table: Table) {
  const o = {} as any;
  for (const [k, v] of table) {
    o[k] = v.declarations.map(({ kind, pos }) => ({ kind: Node[kind], pos }));
  }
  return o;
}

function displayModule(m: Module) {
  return {
    locals: displayTable(m.locals),
    statements: m.statements.map(display),
  };
}

const [tree] = compile(fs.readFileSync('tests/' + file, 'utf8'));
displayModule(tree);
