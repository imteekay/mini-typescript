export enum Token {
  Function = 'Function',
  Var = 'Var',
  Let = 'Let',
  Type = 'Type',
  Return = 'Return',
  Equals = 'Equals',
  NumericLiteral = 'NumericLiteral',
  Identifier = 'Identifier',
  Newline = 'Newline',
  Semicolon = 'Semicolon',
  Colon = 'Colon',
  Whitespace = 'Whitespace',
  String = 'String',
  Unknown = 'Unknown',
  BOF = 'BOF',
  EOF = 'EOF',
}

export type Lexer = {
  scan(): void;
  token(): Token;
  pos(): number;
  text(): string;
  isSingleQuote(): boolean;
};

export enum Node {
  Identifier,
  NumericLiteral,
  Assignment,
  ExpressionStatement,
  Var,
  Let,
  TypeAlias,
  StringLiteral,
  EmptyStatement,
}

export type Error = {
  pos: number;
  message: string;
};

export interface Location {
  pos: number;
}

export type Expression =
  | Identifier
  | NumericLiteral
  | Assignment
  | StringLiteral;

export type Identifier = Location & {
  kind: Node.Identifier;
  text: string;
};

export type NumericLiteral = Location & {
  kind: Node.NumericLiteral;
  value: number;
};

export type StringLiteral = Location & {
  kind: Node.StringLiteral;
  value: string;
  isSingleQuote: boolean;
};

export type Assignment = Location & {
  kind: Node.Assignment;
  name: Identifier;
  value: Expression;
};

export type Statement =
  | ExpressionStatement
  | Var
  | Let
  | TypeAlias
  | EmptyStatement;

export type ExpressionStatement = Location & {
  kind: Node.ExpressionStatement;
  expr: Expression;
};

export type Var = Location & {
  kind: Node.Var;
  name: Identifier;
  typename?: Identifier | undefined;
  init: Expression;
};

export type Let = Location & {
  kind: Node.Let;
  name: Identifier;
  typename?: Identifier | undefined;
  init: Expression;
};

export type TypeAlias = Location & {
  kind: Node.TypeAlias;
  name: Identifier;
  typename: Identifier;
};

export type EmptyStatement = {
  kind: Node.EmptyStatement;
};

export type Declaration = Var | Let | TypeAlias; // plus others, like function

export type Symbol = {
  valueDeclaration: Declaration | undefined;
  declarations: Declaration[];
};

export type Table = Map<string, Symbol>;

export type Module = {
  locals: Table;
  statements: Statement[];
};

export type Type = { id: string };

export enum CharCodes {
  b = 98,
  t = 116,
  n = 110,
  r = 114,
  singleQuote = 39,
  doubleQuote = 34,
  backslash = 92,
}
