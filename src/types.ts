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
  Comma = 'Comma',
  Whitespace = 'Whitespace',
  String = 'String',
  OpenBrace = 'OpenBrace',
  CloseBrace = 'CloseBrace',
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
  TypeLiteral,
  StringLiteral,
  EmptyStatement,
  VariableStatement,
  VariableDeclarationList,
  VariableDeclaration,
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
  | TypeAlias
  | EmptyStatement
  | VariableStatement;

export type ExpressionStatement = Location & {
  kind: Node.ExpressionStatement;
  expr: Expression;
};

export type VariableStatement = Location & {
  kind: Node.VariableStatement;
  declarationList: VariableDeclarationList;
};

export type VariableDeclarationList = Location & {
  kind: Node.VariableDeclarationList;
  declarations: VariableDeclaration[];
  flags: NodeFlags;
};

export type VariableDeclaration = Location & {
  kind: Node.VariableDeclaration;
  name: Identifier;
  typename?: Identifier | undefined;
  init: Expression;
};

export type TypeAlias = Location & {
  kind: Node.TypeAlias;
  name: Identifier;
  typename: Identifier | TypeLiteral;
};

type PropertySignature = Location & {
  name: Identifier;
  typename: Identifier | TypeLiteral;
};

// Added it to member as it's possible to have other types of members. e.g. method signature
export type Member = PropertySignature;

export type TypeLiteral = Location & {
  kind: Node.TypeLiteral;
  members: Member[];
};

export type EmptyStatement = {
  kind: Node.EmptyStatement;
};

export type Declaration = VariableDeclaration | TypeAlias;

export type Symbol = {
  valueDeclaration: VariableDeclaration | undefined;
  declarations: Declaration[];
  flags: SymbolFlags;
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

type CompilerTarget = 'es5' | 'es2015' | 'es2017' | 'es2022';

export interface CompilerOptions {
  target: CompilerTarget;
}

export const enum SymbolFlags {
  None = 0,
  FunctionScopedVariable = 1 << 0, // Variable (var) or parameter
  BlockScopedVariable = 1 << 1, // A block-scoped variable (let or const)
  Type = 1 << 2,
}

export const enum NodeFlags {
  None = 0,
  Let = 1 << 0,
}
