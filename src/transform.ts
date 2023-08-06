import {
  Statement,
  Node,
  CompilerOptions,
  SymbolFlags,
  VariableStatement,
} from './types';

export function transform(
  statements: Statement[],
  compilerOptions: CompilerOptions,
) {
  switch (compilerOptions.target) {
    case 'es5':
      return es2015(typescript(statements));
    default:
      return typescript(statements);
  }
}

/** Convert TS to JS: remove type annotations and declarations */
function typescript(statements: Statement[]) {
  return statements.flatMap(transformStatement);

  function transformStatement(statement: Statement): Statement[] {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return [statement];
      case Node.TypeAlias:
        return [];
      case Node.EmptyStatement:
        return [statement];
      case Node.VariableStatement:
        return [
          {
            ...statement,
            declarationList: {
              ...statement.declarationList,
              declarations: statement.declarationList.declarations.map(
                (declaration) => ({ ...declaration, typename: undefined }),
              ),
            },
          },
        ];
    }
  }
}

/** Convert TS to ES5 JS: remove type annotations and declarations */
function es2015(statements: Statement[]) {
  return statements.flatMap(transformStatement);

  function transformLetIntoVar(statement: VariableStatement) {
    return [
      {
        ...statement,
        declarationList: {
          ...statement.declarationList,
          declarations: statement.declarationList.declarations.map(
            (declaration) => ({
              ...declaration,
              name: { ...declaration.name, text: 'var' },
            }),
          ),
        },
      },
    ];
  }

  function transformStatement(statement: Statement): Statement[] {
    switch (statement.kind) {
      case Node.VariableStatement:
        return statement.declarationList.flags & SymbolFlags.BlockScopedVariable
          ? transformLetIntoVar(statement)
          : [statement];
      default:
        return [statement];
    }
  }
}
