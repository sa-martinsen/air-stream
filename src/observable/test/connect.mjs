import { stream } from '../../index.mjs';
import { series } from '../../utils.mjs';

describe('connect', () => {

  test('connectable stream self-hooked', (done) => {

    done = series(done, []);

    const source = stream(emt => {
      hook();
    });

    let hook = null;

    (hook = source.connectable(done)).connect();

  });

});