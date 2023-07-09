import { Statement, Node, CompilerOptions } from './types';

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
      case Node.Var:
      case Node.Let:
        return [{ ...statement, typename: undefined }];
      case Node.TypeAlias:
        return [];
      case Node.EmptyStatement:
        return [statement];
    }
  }
}

/** Convert TS to ES5 JS: remove type annotations and declarations */
function es2015(statements: Statement[]) {
  return statements.flatMap(transformStatement);

  function transformStatement(statement: Statement): Statement[] {
    switch (statement.kind) {
      case Node.Let:
        return [{ ...statement, typename: undefined, kind: Node.Var }];
      default:
        return [statement];
    }
  }
}
