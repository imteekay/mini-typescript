import {
  Declaration,
  Module,
  Node,
  Statement,
  SymbolFlags,
  Table,
} from './types';
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
      const isValue = isVariableDeclaration(statement.kind);
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
          if (isValue) {
            symbol.valueDeclaration ||= statement;
            symbol.flags |= SymbolFlags.Value;
          }
        }
      } else {
        locals.set(statement.name.text, {
          declarations: [statement],
          valueDeclaration: isValue ? statement : undefined,
          flags: isValue ? SymbolFlags.Value : SymbolFlags.Type,
        });
      }
    }
  }

  function isVariableDeclaration(kind: Statement['kind']) {
    return [Node.Var, Node.Let].includes(kind);
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

export function resolve(locals: Table, name: string, meaning: SymbolFlags) {
  const symbol = locals.get(name);
  if (symbol && symbol.flags & meaning) {
    return symbol;
  }
}
