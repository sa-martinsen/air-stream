import { keyF, merge, stream } from '../../index.mjs';
import { series } from './../../utils.mjs';

describe('merge', () => {

  test('simple', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toBe('a1'),
      evt => expect(evt).toBe('b2'),
      evt => expect(evt).toBe('c3'),
      evt => expect(evt).toBe('d4'),
    ]);

    const source = stream(emt => {
      emt('a1');
      emt('b2');
      emt('c3');
      emt('d4');
    });

    const res = merge([source.filter(x => x[1] % 2)], [source.filter(x => !(x[1] % 2))]);
    res.on(done);

  });

  test('without connectable', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toBe('b2'),
      evt => expect(evt).toBe('d4'),
    ]);

    const source = stream(emt => {
      emt('a1');
      emt('b2');
      emt('c3');
      emt('d4');
    });

    const res = merge([], [source.filter(x => !(x[1] % 2))]);
    res.on(done);

  });

  test('without unconnectable', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toBe('a1'),
      evt => expect(evt).toBe('b2'),
      evt => expect(evt).toBe('c3'),
      evt => expect(evt).toBe('d4'),
    ]);

    const source = stream(emt => {
      emt('a1');
      emt('b2');
      emt('c3');
      emt('d4');
    });

    const res = merge([source.filter(x => x[1] % 2), source.filter(x => !(x[1] % 2))], []);
    res.on(done);

  });

});