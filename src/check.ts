import {
  Module,
  Statement,
  Type,
  Node,
  Expression,
  Identifier,
  TypeAlias,
  Var,
} from './types';
import { error } from './error';
import { resolve } from './bind';

const stringType: Type = { id: 'string' };
const numberType: Type = { id: 'number' };
const errorType: Type = { id: 'error' };
const empty: Type = { id: 'empty' };
const anyType: Type = { id: 'any' };

function typeToString(type: Type) {
  return type.id;
}

export function check(module: Module) {
  return module.statements.map(checkStatement);

  function checkStatement(statement: Statement): Type {
    switch (statement.kind) {
      case Node.ExpressionStatement:
        return checkExpression(statement.expr);
      case Node.TypeAlias:
        return checkType(statement.typename);
      case Node.VariableStatement:
        statement.declarationList.declarations.forEach(checkVarDeclaration);
        return anyType;
      case Node.EmptyStatement:
        return empty;
    }
  }

  function checkExpression(expression: Expression): Type {
    switch (expression.kind) {
      case Node.Identifier:
        const symbol = resolve(module.locals, expression.text, Node.Var);
        if (symbol) {
          return symbol?.valueDeclaration?.kind === Node.Var
            ? checkVarDeclaration(symbol.valueDeclaration!)
            : checkStatement(symbol.valueDeclaration!);
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
    }
  }

  function checkVarDeclaration(varDeclaration: Var) {
    const initType = checkExpression(varDeclaration.init);
    if (!varDeclaration.typename) {
      return initType;
    }
    const type = checkType(varDeclaration.typename);
    if (type !== initType && type !== errorType)
      error(
        varDeclaration.init.pos,
        `Cannot assign initialiser of type '${typeToString(
          initType,
        )}' to variable with declared type '${typeToString(type)}'.`,
      );
    return type;
  }

  function checkType(name: Identifier): Type {
    switch (name.text) {
      case 'string':
        return stringType;
      case 'number':
        return numberType;
      default:
        const symbol = resolve(module.locals, name.text, Node.TypeAlias);
        if (symbol) {
          return checkType(
            (
              symbol.declarations.find(
                (d) => d.kind === Node.TypeAlias,
              ) as TypeAlias
            ).typename,
          );
        }
        error(name.pos, 'Could not resolve type ' + name.text);
        return errorType;
    }
  }
}
