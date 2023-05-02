import {
  Lexer,
  Token,
  Node,
  Statement,
  Identifier,
  Expression,
  Module,
} from './types';
import { error } from './error';

export function parse(lexer: Lexer): Module {
  lexer.scan();
  return parseModule();

  function parseModule(): Module {
    return {
      statements: parseStatements(parseStatement),
      locals: new Map(),
    };
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

    if (tryParseToken(Token.EOF)) {
      return { kind: Node.EndOfFile };
    } else if (tryParseToken(Token.Var)) {
      const name = parseIdentifier();
      const typename = tryParseToken(Token.Colon)
        ? parseIdentifier()
        : undefined;
      parseExpected(Token.Equals);
      const init = parseExpression();
      return { kind: Node.Var, name, typename, init, pos };
    } else if (tryParseToken(Token.Type)) {
      const name = parseIdentifier();
      parseExpected(Token.Equals);
      const typename = parseIdentifier();
      return { kind: Node.TypeAlias, name, typename, pos };
    } else if (tryParseToken(Token.Semicolon)) {
      // if a semicolon is followed by another semicolon,
      // it should return an empty statement
      if (lexer.token() === Token.Semicolon) {
        return { kind: Node.EmptyStatement };
      }
      return parseStatement();
    }
    return { kind: Node.ExpressionStatement, expr: parseExpression(), pos };
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

  function parseStatements<T>(element: () => T) {
    const list = [element()];
    while (lexer.token() !== Token.EOF) {
      list.push(element());
    }
    return list;
  }
}
