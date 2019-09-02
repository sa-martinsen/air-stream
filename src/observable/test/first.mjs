import Observable from '../index.mjs';
import { series } from './../../utils.mjs';

describe('first', () => {

  test('simple', (done) => {

    done = series(done, [
      evt => expect(evt).toBe(Observable.keyF),
      evt => expect(evt).toBe(1)
    ]);

    const source = new Observable(function (emt) {
      emt.emit(1);
      emt.emit(2);
      emt.emit(3);
    }).first();

    source.on(done);
  });

  test('with combine()', (done) => {

    done = series(done, [
      evt => expect(evt).toBe(Observable.keyF),
      evt => expect(evt).toEqual([3, 3])
    ]);

    const a = new Observable(function (emt) {
      emt(1);
      emt(2);
      emt(3);
    });

    const b = new Observable(function (emt) {
      emt(3);
      emt(4);
      emt(5);
    });

    Observable.combine([a, b]).first().on(done);

  });

});