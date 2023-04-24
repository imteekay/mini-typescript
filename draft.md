# Learnings

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

## Checker

- when it's a `var` node
  - runs `checkExpression` to get the type of the expression's `value`
  - runs `checkType` to get the type of the `typename`
  - if there's no `typename`, it should just return the `value`'s type
  - if there's the `typename`, compare the `typename`'s type with the the `value`'s type
    - if there's a mismatch, add a new type error to the compiler
