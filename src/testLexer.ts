import { Token } from './types';
import { lexAll } from './lex';

const lexTests = {
  basicLex: 'x',
  firstLex: ' 1200Hello    World1! 14d',
  underscoreLex: 'x_y is _aSingle Identifier_',
  varLex: 'var x = 1',
  semicolonLex: 'x; y',
  newlineLex: 'x\n y  \n',
};

Object.entries(lexTests).forEach(([name, text]) => {
  console.log(`==== ${name} ====`);
  console.log(
    lexAll(text).map((t) =>
      t.text ? [Token[t.token], t.text] : [Token[t.token]],
    ),
  );
  console.log();
});
