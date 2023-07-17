import {
  Module,
  Node,
  NodeFlags,
  Statement,
  SymbolFlags,
  Table,
  TypeAlias,
  VariableDeclaration,
} from './types';
import { error } from './error';

export function bind(m: Module) {
  for (const statement of m.statements) {
    bindStatement(m.locals, statement);
  }

  function bindStatement(locals: Table, statement: Statement) {
    if (statement.kind === Node.VariableStatement) {
      statement.declarationList.declarations.forEach((declaration) =>
        bindSymbol(locals, declaration, statement.declarationList.flags),
      );
    }

    if (statement.kind === Node.TypeAlias) {
      bindTypeSymbol(locals, statement);
    }
  }

  function bindTypeSymbol(locals: Table, declaration: TypeAlias) {
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
      }
    } else {
      locals.set(declaration.name.text, {
        declarations: [declaration],
        valueDeclaration: undefined,
        flags: SymbolFlags.Type,
      });
    }
  }

  function bindSymbol(
    locals: Table,
    declaration: VariableDeclaration,
    flags: NodeFlags,
  ) {
    const symbol = locals.get(declaration.name.text);
    const isLet = flags & NodeFlags.Let;
    if (symbol) {
      const hasOther =
        willRedeclareLet(flags, symbol.flags) ||
        willRedeclareVarWithLet(flags, symbol.flags) ||
        willRedeclareLetWithVar(flags, symbol.flags);
      if (hasOther) {
        error(
          declaration.pos,
          `Cannot redeclare ${declaration.name.text}; first declared at ${declaration.pos}`,
        );
      } else {
        symbol.declarations.push(declaration);
        symbol.valueDeclaration = declaration;
        symbol.flags |= isLet
          ? SymbolFlags.BlockScopedVariable
          : SymbolFlags.FunctionScopedVariable;
      }
    } else {
      locals.set(declaration.name.text, {
        declarations: [declaration],
        valueDeclaration: declaration,
        flags: isLet
          ? SymbolFlags.BlockScopedVariable
          : SymbolFlags.FunctionScopedVariable,
      });
    }
  }

  function willRedeclareLet(nodeFlags: NodeFlags, symbolFlags: SymbolFlags) {
    return (
      nodeFlags & NodeFlags.Let && symbolFlags & SymbolFlags.BlockScopedVariable
    );
  }

  function willRedeclareVarWithLet(
    nodeFlags: NodeFlags,
    symbolFlags: SymbolFlags,
  ) {
    return (
      nodeFlags & NodeFlags.Let &&
      symbolFlags & SymbolFlags.FunctionScopedVariable
    );
  }

  function willRedeclareLetWithVar(
    nodeFlags: NodeFlags,
    symbolFlags: SymbolFlags,
  ) {
    return !nodeFlags && symbolFlags & SymbolFlags.BlockScopedVariable;
  }
}

export function resolve(locals: Table, name: string, meaning: SymbolFlags) {
  const symbol = locals.get(name);
  if (symbol && symbol.flags & meaning) {
    return symbol;
  }
}
