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

var c: C = {
  a: 'a',
  b: 1
};

var d: D = {
  a: 'a',
  b: 1,
  c: 'a',
  d: 1,
  e: c,
  f: {
    foo: 'string',
    bar: 10
  }
};