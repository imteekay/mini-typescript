# Learnings

## Checker

- when it's a `var` node
  - runs `checkExpression` to get the type of the expression's `value`
  - runs `checkType` to get the type of the `typename`
  - if there's no `typename`, it should just return the `value`'s type
  - if there's the `typename`, compare the `typename`'s type with the the `value`'s type
    - if there's a mismatch, add a new type error to the compiler
