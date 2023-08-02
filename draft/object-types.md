# Object Types

Example

```ts
type A = string;
type B = number;
type C = {
  a: string;
  b: number;
};

type D = {
  a: string;
  b: number;
  c: A;
  d: B;
  e: C;
};
```

A type alias can be

- A literal type (string, number)
- An object type with type literals
- An object type with type literals and identifiers
- An object type with type literals, identifiers, and other object types

## Type Alias: A literal type (string, number)

```ts
type A = string;
type B = number;
```

AST:

```ts
{
  kind: TypeAliasDeclaration,
  name: Identifier,
  type: string | number
}
```

## Type Alias: An object type with type literals

```ts
type C = {
  a: string;
  b: number;
};
```

AST:

```ts
{
  kind: TypeAliasDeclaration,
  name: Identifier,
  type: {
    kind: TypeLiteral,
    members: {
      kind: PropertySignature
      name: Identifier,
      type: string | number
    }[]
  }
}
```

## Type Alias: An object type with type literals and identifiers

```ts
type D = {
  a: string;
  b: number;
  c: A;
  d: B;
  e: C;
};
```

AST:

```ts
// TypeAliasDeclaration
{
  kind: TypeAliasDeclaration,
  name: Identifier,
  type: {
    kind: TypeLiteral,
    members: {
      kind: PropertySignature
      name: Identifier,
      type: string | number | TypeReference
    }[]
  }
}

// TypeReference
{
  kind: TypeReference
  typename: Identifier
}
```

## Type Alias: An object type with type literals, identifiers, and other object types

```ts
type D = {
  a: string;
  b: number;
  c: A;
  d: B;
  e: C;
  f: {
    foo: string;
    bar: number;
  };
};
```

AST:

```ts
// TypeAliasDeclaration
{
  kind: TypeAliasDeclaration,
  name: Identifier,
  type: {
    kind: TypeLiteral,
    members: {
      kind: PropertySignature
      name: Identifier,
      type: string | number | TypeReference | TypeLiteral
    }[]
  }
}

// TypeReference
{
  kind: TypeReference
  typename: Identifier
}

// TypeLiteral
{
  kind: TypeLiteral,
  members: {
    kind: PropertySignature
    name: Identifier,
    type: string | number | TypeReference | TypeLiteral
  }[]
}
```
