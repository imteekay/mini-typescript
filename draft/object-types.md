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
  f: {
    foo: string;
    bar: number;
  };
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
  kind: TypeAlias,
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
  kind: TypeAlias,
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
// TypeAlias
{
  kind: TypeAlias,
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
// TypeAlias
{
  kind: TypeAlias,
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

## Object Literals

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
  f: {
    foo: string;
    bar: number;
  };
};

var a: A = 'string';
var b: B = 11;
var c: C = {
  a: a,
  b: b,
};

var d: D = {
  a: a,
  b: b,
  c: a,
  d: b,
  e: c,
  f: {
    foo: 'string',
    bar: 10,
  },
};
```

It produces this AST

```ts
{
  "statements": [
    {
      "kind": "TypeAlias",
      "name": {
        "kind": "Identifier",
        "text": "A"
      },
      "typename": {
        "kind": "Identifier",
        "text": "string"
      }
    },
    {
      "kind": "TypeAlias",
      "name": {
        "kind": "Identifier",
        "text": "B"
      },
      "typename": {
        "kind": "Identifier",
        "text": "number"
      }
    },
    {
      "kind": "TypeAlias",
      "name": {
        "kind": "Identifier",
        "text": "C"
      },
      "typename": {
        "kind": "TypeLiteral",
        "members": {
          "0": {
            "name": {
              "kind": "Identifier",
              "text": "a"
            },
            "typename": {
              "kind": "Identifier",
              "text": "string"
            }
          },
          "1": {
            "name": {
              "kind": "Identifier",
              "text": "b"
            },
            "typename": {
              "kind": "Identifier",
              "text": "number"
            }
          }
        }
      }
    },
    {
      "kind": "TypeAlias",
      "name": {
        "kind": "Identifier",
        "text": "D"
      },
      "typename": {
        "kind": "TypeLiteral",
        "members": {
          "0": {
            "name": {
              "kind": "Identifier",
              "text": "a"
            },
            "typename": {
              "kind": "Identifier",
              "text": "string"
            }
          },
          "1": {
            "name": {
              "kind": "Identifier",
              "text": "b"
            },
            "typename": {
              "kind": "Identifier",
              "text": "number"
            }
          },
          "2": {
            "name": {
              "kind": "Identifier",
              "text": "c"
            },
            "typename": {
              "kind": "Identifier",
              "text": "A"
            }
          },
          "3": {
            "name": {
              "kind": "Identifier",
              "text": "d"
            },
            "typename": {
              "kind": "Identifier",
              "text": "B"
            }
          },
          "4": {
            "name": {
              "kind": "Identifier",
              "text": "e"
            },
            "typename": {
              "kind": "Identifier",
              "text": "C"
            }
          },
          "5": {
            "name": {
              "kind": "Identifier",
              "text": "f"
            },
            "typename": {
              "kind": "TypeLiteral",
              "members": {
                "0": {
                  "name": {
                    "kind": "Identifier",
                    "text": "foo"
                  },
                  "typename": {
                    "kind": "Identifier",
                    "text": "string"
                  }
                },
                "1": {
                  "name": {
                    "kind": "Identifier",
                    "text": "bar"
                  },
                  "typename": {
                    "kind": "Identifier",
                    "text": "number"
                  }
                }
              }
            }
          }
        }
      }
    },
    {
      "kind": "VariableStatement",
      "declarationList": {
        "kind": "VariableDeclarationList",
        "declarations": {
          "0": {
            "kind": "VariableDeclaration",
            "name": {
              "kind": "Identifier",
              "text": "a"
            },
            "typename": {
              "kind": "Identifier",
              "text": "A"
            },
            "init": {
              "kind": "StringLiteral",
              "value": "string",
              "isSingleQuote": true
            }
          }
        },
        "flags": 0
      }
    },
    {
      "kind": "VariableStatement",
      "declarationList": {
        "kind": "VariableDeclarationList",
        "declarations": {
          "0": {
            "kind": "VariableDeclaration",
            "name": {
              "kind": "Identifier",
              "text": "b"
            },
            "typename": {
              "kind": "Identifier",
              "text": "B"
            },
            "init": {
              "kind": "NumericLiteral",
              "value": 11
            }
          }
        },
        "flags": 0
      }
    },
    {
      "kind": "VariableStatement",
      "declarationList": {
        "kind": "VariableDeclarationList",
        "declarations": {
          "0": {
            "kind": "VariableDeclaration",
            "name": {
              "kind": "Identifier",
              "text": "c"
            },
            "typename": {
              "kind": "Identifier",
              "text": "C"
            },
            "init": {
              "kind": "ObjectLiteralExpression",
              "properties": {
                "0": {
                  "name": {
                    "kind": "Identifier",
                    "text": "a"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "a"
                  }
                },
                "1": {
                  "name": {
                    "kind": "Identifier",
                    "text": "b"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "b"
                  }
                }
              }
            }
          }
        },
        "flags": 0
      }
    },
    {
      "kind": "VariableStatement",
      "declarationList": {
        "kind": "VariableDeclarationList",
        "declarations": {
          "0": {
            "kind": "VariableDeclaration",
            "name": {
              "kind": "Identifier",
              "text": "d"
            },
            "typename": {
              "kind": "Identifier",
              "text": "D"
            },
            "init": {
              "kind": "ObjectLiteralExpression",
              "properties": {
                "0": {
                  "name": {
                    "kind": "Identifier",
                    "text": "a"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "a"
                  }
                },
                "1": {
                  "name": {
                    "kind": "Identifier",
                    "text": "b"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "b"
                  }
                },
                "2": {
                  "name": {
                    "kind": "Identifier",
                    "text": "c"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "a"
                  }
                },
                "3": {
                  "name": {
                    "kind": "Identifier",
                    "text": "d"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "b"
                  }
                },
                "4": {
                  "name": {
                    "kind": "Identifier",
                    "text": "e"
                  },
                  "init": {
                    "kind": "Identifier",
                    "text": "c"
                  }
                },
                "5": {
                  "name": {
                    "kind": "Identifier",
                    "text": "f"
                  },
                  "init": {
                    "kind": "ObjectLiteralExpression",
                    "properties": {
                      "0": {
                        "name": {
                          "kind": "Identifier",
                          "text": "foo"
                        },
                        "init": {
                          "kind": "StringLiteral",
                          "value": "string",
                          "isSingleQuote": true
                        }
                      },
                      "1": {
                        "name": {
                          "kind": "Identifier",
                          "text": "bar"
                        },
                        "init": {
                          "kind": "NumericLiteral",
                          "value": 10
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "flags": 0
      }
    }
  ]
}
```

## Type Checking

Two way type checking:

1. going from the value and checking the type definition
2. going from the type definition and checking the value properties

Check phases

1. Any property type mismatch should generate this error

```
Type {X} is not assignable to {Y}
```

2. Go through the list of properties. For each one, check if it's defined in the type definition. If it's not, it should generate the type error

```
Object literal may only specify known properties, and 'g' does not exist in type 'D'.
```

3. Every property was right but it's missing some from the type definition

```
Type '{ a: string; b: number; }' is missing the following properties from type 'D': c, d, e, f
```

### Object type structure

```ts
type ObjecType = {
  flags: ObjectFlag;
  members: Record<string, Symbol>;
};
```

A module can have many different object types:

```ts
type ObjectTypes = {
  [key: string]: ObjectType;
};
```

So we can use it like:

```ts
const objectsTypes: ObjectTypes = {
  A: {
    flags: ObjectFlag,
    members: {
      a: number,
    },
  },
};

objectTypes.get('A').members.get('a');
```
