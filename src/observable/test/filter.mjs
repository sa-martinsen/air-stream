import Observable from '../index.mjs';
import { series } from '../../utils.mjs';

describe('filter.mjs', () => {

  test('simple', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(1),
      evt => expect(evt).toEqual(5),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(1);
      emt(2);
      emt(3);
      emt(4);
      emt(5);
    });

    source
      .filter(x => x % 2)
      .filter(x => x % 3)
      .on(done);

  });

  test('with reconnect', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(5),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(1);
      emt(2);
      emt(3);
      emt.kf();
      emt(4);
      emt(5);
    });

    source
      .filter(x => x % 2)
      .on(done);

  });

});