import { Error, Module } from './types';
import { errors } from './error';
import { lex } from './lex';
import { parse } from './parse';
import { bind } from './bind';
import { check } from './check';
import { transform } from './transform';
import { emit } from './emit';

export function compile(sourceCode: string): [Module, Error[], string] {
  errors.clear();
  const tree = parse(lex(sourceCode));
  bind(tree);
  check(tree);
  const js = emit(transform(tree.statements));
  return [tree, Array.from(errors.values()), js];
}
