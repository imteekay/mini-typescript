import { Module, Node, Statement, Table } from './types';
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
            d.kind === statement.kind ||
            (d.kind === Node.Var && statement.kind === Node.Let) ||
            (d.kind === Node.Let && statement.kind === Node.Var),
        );
        if (other) {
          error(
            statement.pos,
            `Cannot redeclare ${statement.name.text}; first declared at ${other.pos}`,
          );
        } else {
          symbol.declarations.push(statement);
          if ([Node.Var, Node.Let].includes(statement.kind)) {
            symbol.valueDeclaration = statement;
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
}

export function resolve(
  locals: Table,
  name: string,
  meaning: Node.Var | Node.TypeAlias | Node.Let,
) {
  const symbol = locals.get(name);
  if (symbol?.declarations.some((d) => d.kind === meaning)) {
    return symbol;
  }
}
