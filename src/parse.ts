import {
  Lexer,
  Token,
  Node,
  Statement,
  Identifier,
  Expression,
  Module,
  Var,
} from './types';
import { error } from './error';

const emptyTokens = [Token.EOF, Token.Semicolon];

export function parse(lexer: Lexer): Module {
  lexer.scan();
  return parseModule();

  function parseModule(): Module {
    const statements = parseSeparated(parseStatement, () =>
      tryParseToken(Token.Semicolon),
    );
    parseExpected(Token.EOF);
    return { statements, locals: new Map() };
  }

  function parseExpression(): Expression {
    const pos = lexer.pos();
    const e = parseIdentifierOrLiteral();
    if (e.kind === Node.Identifier && tryParseToken(Token.Equals)) {
      return { kind: Node.Assignment, name: e, value: parseExpression(), pos };
    }
    return e;
  }

  function parseIdentifierOrLiteral(): Expression {
    const pos = lexer.pos();
    if (tryParseToken(Token.Identifier)) {
      return { kind: Node.Identifier, text: lexer.text(), pos };
    } else if (tryParseToken(Token.NumericLiteral)) {
      return { kind: Node.NumericLiteral, value: +lexer.text(), pos };
    } else if (tryParseToken(Token.String)) {
      return {
        kind: Node.StringLiteral,
        value: lexer.text(),
        pos,
        isSingleQuote: lexer.isSingleQuote(),
      };
    }
    error(
      pos,
      'Expected identifier or literal but got ' + Token[lexer.token()],
    );
    lexer.scan();
    return { kind: Node.Identifier, text: '(missing)', pos };
  }

  function parseIdentifier(): Identifier {
    const e = parseIdentifierOrLiteral();
    if (e.kind === Node.Identifier) {
      return e;
    }
    error(e.pos, 'Expected identifier but got a literal');
    return { kind: Node.Identifier, text: '(missing)', pos: e.pos };
  }

  function parseStatement(): Statement {
    const pos = lexer.pos();
    if (tryParseToken(Token.Var)) {
      return {
        kind: Node.VariableDeclarationList,
        declarations: parseVariableDeclarations(),
        pos,
      };
    } else if (tryParseToken(Token.Type)) {
      const name = parseIdentifier();
      parseExpected(Token.Equals);
      const typename = parseIdentifier();
      return { kind: Node.TypeAlias, name, typename, pos };
    } else if (emptyTokens.includes(lexer.token())) {
      return { kind: Node.EmptyStatement };
    }
    return { kind: Node.ExpressionStatement, expr: parseExpression(), pos };
  }

  function parseVariableDeclarations() {
    const declarations: Var[] = [];
    do {
      const name = parseIdentifier();
      const typename = tryParseToken(Token.Colon)
        ? parseIdentifier()
        : undefined;
      parseExpected(Token.Equals);
      const init = parseExpression();
      declarations.push({
        kind: Node.Var,
        name,
        typename,
        init,
        pos: lexer.pos(),
      });
    } while (tryParseToken(Token.Comma));
    return declarations;
  }

  function tryParseToken(expected: Token) {
    const ok = lexer.token() === expected;
    if (ok) {
      lexer.scan();
    }
    return ok;
  }

  function parseExpected(expected: Token) {
    if (!tryParseToken(expected)) {
      error(
        lexer.pos(),
        `parseToken: Expected ${Token[expected]} but got ${
          Token[lexer.token()]
        }`,
      );
    }
  }

  function parseSeparated<T>(element: () => T, separator: () => unknown) {
    const list = [element()];
    while (separator()) {
      list.push(element());
    }
    return list;
  }
}
