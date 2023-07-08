import { Declaration, Module, Node, Statement, Table } from './types';
import { error } from './error';

export function bind(m: Module) {
  for (const statement of m.statements) {
    bindStatement(m.locals, statement);
  }

  function bindStatement(locals: Table, statement: Statement) {
    if (
      statement.kind === Node.Var ||
      statement.kind === Node.TypeAlias ||
      statement.kind === Node.Let
    ) {
      const symbol = locals.get(statement.name.text);
      if (symbol) {
        const other = symbol.declarations.find(
          (d) =>
            hasEqualKindButNotVar(d, statement) ||
            willRedeclareVarWithLet(d, statement) ||
            willRedeclareLetWithVar(d, statement),
        );
        if (other) {
          error(
            statement.pos,
            `Cannot redeclare ${statement.name.text}; first declared at ${other.pos}`,
          );
        } else {
          symbol.declarations.push(statement);
          if ([Node.Var, Node.Let].includes(statement.kind)) {
            symbol.valueDeclaration ||= statement;
          }
        }
      } else {
        locals.set(statement.name.text, {
          declarations: [statement],
          valueDeclaration: [Node.Var, Node.Let].includes(statement.kind)
            ? statement
            : undefined,
        });
      }
    }
  }

  function hasEqualKindButNotVar(
    declaration: Declaration,
    statement: Statement,
  ) {
    return declaration.kind === statement.kind && statement.kind !== Node.Var;
  }

  function willRedeclareVarWithLet(
    declaration: Declaration,
    statement: Statement,
  ) {
    return declaration.kind === Node.Var && statement.kind === Node.Let;
  }

  function willRedeclareLetWithVar(
    declaration: Declaration,
    statement: Statement,
  ) {
    return declaration.kind === Node.Let && statement.kind === Node.Var;
  }
}

export enum Meaning {
  Value,
  Type,
}

export function resolve(locals: Table, name: string, meaning: Meaning) {
  const symbol = locals.get(name);
  if (
    symbol?.declarations.some((d) =>
      meaning === Meaning.Value
        ? [Node.Var, Node.Let].includes(d.kind)
        : d.kind === Node.TypeAlias,
    )
  ) {
    return symbol;
  }
}
