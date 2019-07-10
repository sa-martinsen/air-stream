import { series } from '../../utils.mjs';
import { combine, keyF, stream } from '../../index.mjs';

describe('combine', () => {

  test('simple1', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toEqual([1, 2]),
      evt => expect(evt).toEqual([1, 3]),
      evt => expect(evt).toEqual([4, 3]),
      evt => expect(evt).toEqual([5, 3]),
      evt => expect(evt).toEqual([5, 6]),
    ]);

    const source = stream(function (emt) {
      emt({ count: 1, path: 'a' });
      emt({ count: 2, path: 'b' });
      emt({ count: 3, path: 'b' });
      emt({ count: 4, path: 'a' });
      setTimeout(() => emt({ count: 5, path: 'a' }));
      setTimeout(() => emt({ count: 6, path: 'b' }));
    });

    const a = source.filter(({ path }) => path === 'a');
    const b = source.filter(({ path }) => path === 'b');

    combine([a, b], ({ count: a }, { count: b }) => [a, b]).on(done);

  });

  test('combine key', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
    ]);

    const source = stream(function (emt) {
      emt.kf();
    });

    const a = source.filter(({ path }) => path === 'a');
    const b = source.filter(({ path }) => path === 'b');

    combine([a, b], ({ count: a }, { count: b }) => [a, b]).on(done);

  });

  test('to many streams', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toEqual(['d', 'd', 'd', 'd']),
    ]);

    const a = stream(function (emt) {
      emt('a');
      emt('b');
      emt('c');
      setTimeout(() => emt('d'), 10);
    });

    const b = stream(function (emt) {
      emt('c');
      emt('d');
      setTimeout(() => emt('e'), 10);
    });

    const c = stream(function (emt) {
      emt('c');
      setTimeout(() => emt('d'), 10);
    });

    const d = stream(function (emt) {
      emt('a');
      emt('b');
      emt('d');
    });

    combine([a, b, c, d].map(obs => obs.filter(v => v === 'd'))).on(done);

  });

  test('loop', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      //evt => expect(evt).toEqual(["b1", "b", "b"]),
      evt => expect(evt).toEqual(['b1', 'b', 'c']),
      evt => expect(evt).toEqual(['c1', 'b', 'c']),
    ]);

    const source = stream(function (emt) {
      emt('a');
      emt('b');
      emt('c');
    });

    const a = source.map(evt => evt + '1');
    const b = source.filter(evt => evt === 'b');

    combine([a, b, source]).on(done);

  });

});