import { error } from './error';
import { Token, Lexer, CharCodes } from './types';

const keywords = {
  function: Token.Function,
  var: Token.Var,
  let: Token.Let,
  type: Token.Type,
  return: Token.Return,
};

export function lex(s: string): Lexer {
  let pos = 0;
  let text = '';
  let token = Token.BOF;
  let firstChar: string;

  return {
    scan,
    token: () => token,
    pos: () => pos,
    text: () => text,
    isSingleQuote: () => firstChar === "'",
  };

  function scan() {
    scanForward(isEmptyStrings);
    const start = pos;

    if (pos === s.length) {
      token = Token.EOF;
    } else if (/[0-9]/.test(s.charAt(pos))) {
      scanForward(isNumber);
      text = s.slice(start, pos);
      token = Token.NumericLiteral;
    } else if (/[_a-zA-Z]/.test(s.charAt(pos))) {
      scanForward(isAlphanumerical);
      text = s.slice(start, pos);
      token =
        text in keywords
          ? keywords[text as keyof typeof keywords]
          : Token.Identifier;
    } else if (['"', "'"].includes(s.charAt(pos))) {
      firstChar = s.charAt(pos);
      text = scanString();
      token = Token.String;
    } else {
      pos++;
      switch (s.charAt(pos - 1)) {
        case '=':
          token = Token.Equals;
          break;
        case ';':
          token = Token.Semicolon;
          break;
        case ':':
          token = Token.Colon;
          break;
        case ',':
          token = Token.Comma;
          break;
        default:
          token = Token.Unknown;
          break;
      }
    }
  }

  function isEmptyStrings(c: string) {
    // scan forward all
    // \t - tabs
    // \b - empty strings at the beginning and end of a word
    // \n - newline char
    return /[ \t\b\n]/.test(c);
  }

  function isNumber(c: string) {
    return /[0-9]/.test(c);
  }

  function isAlphanumerical(c: string) {
    return /[_a-zA-Z0-9]/.test(c);
  }

  function scanForward(pred: (x: string) => boolean) {
    while (pos < s.length && pred(s.charAt(pos))) pos++;
  }

  function scanString() {
    const quote = s.charCodeAt(pos);
    pos++;

    let stringValue = '';
    let start = pos;

    while (true) {
      if (pos >= s.length) {
        error(pos, 'Unterminated string literal');
        stringValue += s.slice(start, pos);
        break;
      }

      const char = s.charCodeAt(pos);

      if (char === quote) {
        stringValue += s.slice(start, pos);
        pos++;
        break;
      }

      if (char === CharCodes.backslash) {
        stringValue += s.slice(start, pos);
        stringValue += scanEscapeSequence();
        start = pos;
        continue;
      }

      pos++;
    }

    return stringValue;
  }

  function scanEscapeSequence() {
    pos++;
    const char = s.charCodeAt(pos);
    pos++;

    switch (char) {
      case CharCodes.b:
        return '\b';
      case CharCodes.t:
        return '\t';
      case CharCodes.n:
        return '\n';
      case CharCodes.r:
        return '\r';
      case CharCodes.singleQuote:
        // prettier-ignore
        return "\'";
      case CharCodes.doubleQuote:
        // prettier-ignore
        return '\"';
      default:
        return String.fromCharCode(char);
    }
  }
}

export function lexAll(s: string) {
  const lexer = lex(s);
  let tokens = [];
  let token;

  while (true) {
    lexer.scan();
    token = lexer.token();

    switch (token) {
      case Token.EOF:
        return tokens;
      case Token.Identifier:
      case Token.NumericLiteral:
      case Token.String:
        tokens.push({ token, text: lexer.text() });
        break;
      default:
        tokens.push({ token });
        break;
    }
  }
}
