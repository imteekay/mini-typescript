import {
  Module,
  Statement,
  Type,
  Node,
  Expression,
  Identifier,
  TypeAlias,
  VariableDeclaration,
  SymbolFlags,
  Symbol,
  TypeLiteral,
  TypeFlags,
  Member,
  PropertySignature,
  TypeTable,
  PropertyAssignment,
} from './types';
import { error } from './error';
import { resolve } from './bind';

const stringType: Type = { id: 'string', flags: TypeFlags.Any };
const numberType: Type = { id: 'number', flags: TypeFlags.NumericLiteral };
const errorType: Type = { id: 'error', flags: TypeFlags.Any };
const empty: Type = { id: 'empty', flags: TypeFlags.Any };
const anyType: Type = { id: 'any', flags: TypeFlags.Any };

function createObjectType(members: TypeTable): Type {
  return {
    id: 'object',
    flags: TypeFlags.Object,
    members,
  };
}

function typeToString(type: Type) {
  return type.id;
}

export function check(module: Module) {
  const objectTypes = new Map<string, Type>();
  return module.statements.map(checkStatement);

  function checkStatement(statement: Statement): Type {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return checkExpression(statement.expr);
      case Node.TypeAlias:
        return checkTypeIdentifierOrObjectType(statement);
      case Node.VariableStatement:
        statement.declarationList.declarations.forEach(
          checkVariableDeclaration,
        );
        return anyType;
      case Node.EmptyStatement:
        return empty;
    }
  }

  function checkExpression(expression: Expression): Type {
    switch (expression.kind) {
      case Node.Identifier:
        const symbol = resolve(
          module.locals,
          expression.text,
          SymbolFlags.FunctionScopedVariable | SymbolFlags.BlockScopedVariable,
        );

        if (symbol) {
          if (isBlockScopedVarUsedBeforeItsDeclaration(symbol, expression)) {
            error(
              expression.pos,
              `Block-scoped variable '${expression.text}' used before its declaration.`,
            );
          }

          return checkVariableDeclaration(symbol.valueDeclaration!);
        }

        error(expression.pos, 'Could not resolve ' + expression.text);
        return errorType;
      case Node.NumericLiteral:
        return numberType;
      case Node.StringLiteral:
        return stringType;
      case Node.Assignment:
        const v = checkExpression(expression.value);
        const t = checkExpression(expression.name);
        if (t !== v)
          error(
            expression.value.pos,
            `Cannot assign value of type '${typeToString(
              v,
            )}' to variable of type '${typeToString(t)}'.`,
          );
        return t;
      case Node.ObjectLiteralExpression:
        return createObjectType(checkPropertyTypes(expression.properties));
    }
  }

  function isBlockScopedVarUsedBeforeItsDeclaration(
    symbol: Symbol,
    expression: Expression,
  ) {
    const isBlockScopedVar = symbol.flags & SymbolFlags.BlockScopedVariable;
    return isBlockScopedVar && symbol.valueDeclaration!.pos > expression.pos;
  }

  function checkVariableDeclaration(declaration: VariableDeclaration) {
    const initType = checkExpression(declaration.init);
    const varSymbol = resolve(
      module.locals,
      declaration.name.text,
      SymbolFlags.FunctionScopedVariable,
    );

    // handle subsequent variable declarations types — generate an error if it has type mismatches
    if (varSymbol && declaration !== varSymbol.valueDeclaration) {
      const valueDeclarationType = checkVariableDeclarationType(
        varSymbol.valueDeclaration!,
      );

      const type = declaration.typename
        ? checkType(declaration.typename)
        : initType;

      handleSubsequentVariableDeclarationsTypes(
        declaration,
        valueDeclarationType,
        type,
      );
    }

    if (!declaration.typename) {
      return initType;
    }

    const type = checkType(declaration.typename);

    if (type !== initType && type !== errorType)
      error(
        declaration.init.pos,
        `Cannot assign initialiser of type '${typeToString(
          initType,
        )}' to variable with declared type '${typeToString(type)}'.`,
      );

    return type;
  }

  function checkVariableDeclarationType(declaration: VariableDeclaration) {
    return declaration.typename
      ? checkType(declaration.typename)
      : checkExpression(declaration.init);
  }

  function checkType(name: Identifier): Type {
    switch (name.text) {
      case 'string':
        return stringType;
      case 'number':
        return numberType;
      default:
        const symbol = resolve(module.locals, name.text, SymbolFlags.Type);
        if (symbol) {
          return checkTypeIdentifierOrObjectType(
            symbol.declarations.find(
              (d) => d.kind === Node.TypeAlias,
            ) as TypeAlias,
          );
        }
        error(name.pos, 'Could not resolve type ' + name.text);
        return errorType;
    }
  }

  function checkObjecType(statement: TypeAlias | PropertySignature) {
    objectTypes.set(
      statement.name.text,
      createObjectType(
        checkMemberTypes((statement.typename as TypeLiteral).members),
      ),
    );

    return objectTypes.get(statement.name.text) as Type;
  }

  function checkMemberTypes(members: Member[]) {
    const membersTable = new Map<string, Type>();
    members.forEach((member) =>
      membersTable.set(
        member.name.text,
        checkTypeIdentifierOrObjectType(member),
      ),
    );
    return membersTable;
  }

  function checkPropertyTypes(properties: PropertyAssignment[]) {
    const membersTable = new Map<string, Type>();
    properties.forEach((property) =>
      membersTable.set(
        'text' in property.name
          ? property.name.text
          : property.name.value.toString(),
        checkTypeIdentifierOrObjectType(property),
      ),
    );
    return membersTable;
  }

  function checkTypeIdentifierOrObjectType(
    statement: TypeAlias | PropertySignature | PropertyAssignment,
  ) {
    return 'typename' in statement
      ? statement.typename.kind === Node.TypeLiteral
        ? checkObjecType(statement)
        : checkType(statement.typename)
      : checkExpression(statement.init);
  }

  function handleSubsequentVariableDeclarationsTypes(
    declaration: VariableDeclaration,
    valueDeclarationType: Type,
    declarationType: Type,
  ) {
    if (valueDeclarationType !== declarationType) {
      error(
        declaration.pos,
        `Subsequent variable declarations must have the same type. Variable '${
          declaration.name.text
        }' must be of type '${typeToString(
          valueDeclarationType,
        )}', but here has type '${typeToString(declarationType)}'.`,
      );
    }
  }
}
