# Learnings

## How to debug

- Use [`astexplorer`](https://astexplorer.net) to understand tokens/AST
- Read the [ECMAScript specification](https://tc39.es/ecma262/multipage/#sec-intro)
- Run `npm run test:file test-filename.ts` to debug only one test at a time. Replace the `test-filename.ts` with the test file name you want to test
- Add the baselines and run `npm run test` and compare the local with the references

## Lexer

- scan forward all
  - \t - tabs
  - \b - empty strings at the beginning and end of a word
  - \n - newline char
- if at the end of input, it's a `EOF` token
- if numbers, scan all numbers, add the number to the `text`, and the `Literal` token to the `token`
- if alphabetical chars, scan all chars, add the string to the `text`, and the token can be a `Keyword` or an `Identifier`
- scan tokens like `Equals`, `Semicolon`, `Colon`, etc
- if not in the list, it's a `Unknown` token

## Parser

- Use the lexer to walkthrough the tokens and create the AST nodes
- Parse statements
  - Var statements
  - type statements
  - expressions
- Var AST node
  - name -> identifier
  - typename -> type definition (if there's no `Colon` token, the `typename` should be `undefined`)
  - init -> the value
  - pos -> position

## Checker

- `checkExpression`
- when it's a `var` node
  - runs `checkExpression` to get the type of the expression's `value`
  - runs `checkType` to get the type of the `typename`
  - if there's no `typename`, it should just return the `value`'s type
  - if there's the `typename`, compare the `typename`'s type with the the `value`'s type
    - if there's a mismatch, add a new type error to the compiler
- when it's a `expression` node
  - runs `checkExpression`
