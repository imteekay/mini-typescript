import {
  Lexer,
  Token,
  Node,
  Statement,
  Identifier,
  Expression,
  Module,
  VariableDeclaration,
  NodeFlags,
  VariableStatement,
  TypeLiteral,
  Member,
} from './types';
import { error } from './error';

export function parse(lexer: Lexer): Module {
  lexer.scan();
  return parseModule();

  function parseModule(): Module {
    return {
      statements: parseList(
        parseStatement,
        () => tryParseToken(Token.Semicolon),
        () => lexer.token() !== Token.EOF,
      ),
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

  function parseMember(): Member {
    const pos = lexer.pos();
    const name = parseIdentifier();
    parseExpected(Token.Colon);
    const typename = tryParseToken(Token.OpenBrace)
      ? parseTypeLiteral()
      : parseIdentifier();

    return {
      name,
      typename,
      pos,
    };
  }

  function parseTypeLiteral(): TypeLiteral {
    return {
      kind: Node.TypeLiteral,
      members: parseList(
        parseMember,
        () => tryParseToken(Token.Semicolon),
        () => !tryParseToken(Token.CloseBrace),
      ),
      pos: lexer.pos(),
    };
  }

  function parseStatement(): Statement {
    const pos = lexer.pos();

    if (tryParseToken(Token.Var)) {
      return parseVariableStatement(NodeFlags.None);
    } else if (tryParseToken(Token.Let)) {
      return parseVariableStatement(NodeFlags.Let);
    } else if (tryParseToken(Token.Type)) {
      const name = parseIdentifier();
      parseExpected(Token.Equals);
      const typename = tryParseToken(Token.OpenBrace)
        ? parseTypeLiteral()
        : parseIdentifier();
      return { kind: Node.TypeAlias, name, typename, pos };
    } else if (tryParseToken(Token.Semicolon)) {
      return { kind: Node.EmptyStatement };
    }
    return { kind: Node.ExpressionStatement, expr: parseExpression(), pos };
  }

  function parseVariableStatement(flags: NodeFlags): VariableStatement {
    const pos = lexer.pos();
    return {
      kind: Node.VariableStatement,
      pos,
      declarationList: {
        kind: Node.VariableDeclarationList,
        declarations: parseVariableDeclarations(),
        flags,
        pos,
      },
    };
  }

  function parseVariableDeclarations() {
    const declarations: VariableDeclaration[] = [];
    do {
      const name = parseIdentifier();
      const typename = tryParseToken(Token.Colon)
        ? parseIdentifier()
        : undefined;
      parseExpected(Token.Equals);
      const init = parseExpression();
      declarations.push({
        kind: Node.VariableDeclaration,
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

  function parseList<T>(
    element: () => T,
    terminator: () => boolean,
    peek: () => boolean,
  ) {
    const list = [];
    while (peek()) {
      list.push(element());
      terminator();
    }
    return list;
  }
}
