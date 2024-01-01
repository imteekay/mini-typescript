# mini-typescript

This is a fork from [Nathan Shively-Sanders](https://github.com/sandersn)'s [mini-typescript](https://github.com/sandersn/mini-typescript).

The purpose of this repo is to practice the exercises and learn more about compilers and TypeScript.

### To get set up

```bash
# Get set up
npm i
npm run build

# Or have your changes instantly happen
npm run build --watch

# Run the compiler:
npm run mtsc ./tests/singleVar.ts
```

## Limitations

1. This is an example of the way that Typescript's compiler does things. A compiler textbook will help you learn _compilers_. This project will help you learn _Typescript's code_.
2. This is only a tiny slice of the language, also unlike a textbook. Often I only put it one instance of a thing, like nodes that introduce a scope, to keep the code size small.
3. There is no laziness, caching or node reuse, so the checker and transformer code do not teach you those aspects of the design.
4. There's no surrounding infrastructure, like a language service or a program builder. This is just a model of tsc.

## Exercises

- [x] Add EmptyStatement (https://github.com/imteekay/mini-typescript-fork/pull/2).
- [x] Make semicolon a statement ender, not statement separator (https://github.com/imteekay/mini-typescript-fork/pull/7).
  - Hint: You'll need a predicate to peek at the next token and decide if it's the start of an element.
  - [ ] Bonus: Switch from semicolon to newline as statement ender.
- [x] Add string literals (https://github.com/imteekay/mini-typescript-fork/pull/4).
- [x] Refactor: rename `Literal` to `NumericLiteral` (https://github.com/imteekay/mini-typescript-fork/pull/6).
- [x] Add support for the lexer to report errors (https://github.com/imteekay/mini-typescript-fork/pull/12)
  - report unterminated string literal error
- [x] Add let (https://github.com/imteekay/mini-typescript-fork/pull/8).
  - [x] Make sure the binder resolves variables declared with `var` and `let` the same way. The simplest way is to add a `kind` property to `Symbol`.
  - [x] Add use-before-declaration errors in the checker.
  - [x] Finally, add an ES2015 -> ES5 transform that transforms `let` to `var`.
- [x] Allow var statements to declare multiple symbols (https://github.com/imteekay/mini-typescript-fork/pull/9).
- [x] Allow var to have multiple declarations. (https://github.com/imteekay/mini-typescript/pull/2)
  - You'll need to convert a Symbol's declaration into a list.
  - Check that all declarations have the same type.
- [ ] Add objects and object types.
  - [ ] Implement mapped types
  - [ ] Implement optional member
  - [ ] Implement method signature
- [ ] Add `interface`.
  - Make sure the binder resolves types declared with `type` and `interface` the same way.
  - After the basics are working, allow interface to have multiple declarations.
  - Interfaces should have an object type, but that object type should combine the properties from every declaration.
- [ ] Implement union types
- [ ] Add an ES5 transformer that converts `let` -> `var`.
- [ ] Add function declarations and function calls.
- [ ] Add arrow functions with an appropriate transform in ES5.
