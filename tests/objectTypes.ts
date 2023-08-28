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
  b: b
};

var d: D = {
  a: a,
  b: b,
  c: a,
  d: b,
  e: c,
  f: {
    foo: 'string',
    bar: 10
  }
};