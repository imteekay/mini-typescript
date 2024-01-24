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

var a: D = 'string';
var b: D = 1;
var c: D = {
  a: 1
}

var d: D = {
  f: {
    foo: 123
  }
}

type E = {
  a: {
    foo: {
      bar: number
    }
  }
}

var e: E = {
  a: {
    foo: {
      bar: '123'
    }
  }
}

type F = {
  a: number
}

var f: F = {
  b: 123
}

var g: F = {
  a: '123',
  b: 123
}
