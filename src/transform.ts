import { Statement, Node, Var } from './types';

export function transform(statements: Statement[]) {
  return typescript(statements);
}

/** Convert TS to JS: remove type annotations and declarations */
function typescript(statements: Statement[]) {
  return statements.flatMap(transformStatement);

  function transformStatement(statement: Statement): Statement[] {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return [statement];
      case Node.Var:
        return [{ ...statement, typename: undefined }];
      case Node.TypeAlias:
        return [];
      case Node.EmptyStatement:
        return [statement];
      case Node.VariableDeclarationList:
        return [
          {
            ...statement,
            declarations: statement.declarations.flatMap(
              transformStatement,
            ) as Var[],
          },
        ];
    }
  }
}
