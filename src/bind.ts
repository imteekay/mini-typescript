import { Module, Node, Statement, Table, TypeAlias, Var } from './types';
import { error } from './error';

export function bind(m: Module) {
  for (const statement of m.statements) {
    bindStatement(m.locals, statement);
  }

  function bindStatement(locals: Table, statement: Statement) {
    if (statement.kind === Node.VariableStatement) {
      statement.declarationList.declarations.forEach((declaration) =>
        bindSymbol(locals, declaration),
      );
    }

    if (statement.kind === Node.TypeAlias) {
      bindSymbol(locals, statement);
    }
  }

  function bindSymbol(locals: Table, declaration: Var | TypeAlias) {
    const symbol = locals.get(declaration.name.text);
    if (symbol) {
      const other = symbol.declarations.find(
        (d) => d.kind === declaration.kind,
      );
      if (other) {
        error(
          declaration.pos,
          `Cannot redeclare ${declaration.name.text}; first declared at ${other.pos}`,
        );
      } else {
        symbol.declarations.push(declaration);
        if (declaration.kind === Node.Var) {
          symbol.valueDeclaration = declaration;
        }
      }
    } else {
      locals.set(declaration.name.text, {
        declarations: [declaration],
        valueDeclaration:
          declaration.kind === Node.Var ? declaration : undefined,
      });
    }
  }
}

export function resolve(
  locals: Table,
  name: string,
  meaning: Node.Var | Node.TypeAlias,
) {
  const symbol = locals.get(name);
  if (symbol?.declarations.some((d) => d.kind === meaning)) {
    return symbol;
  }
}
