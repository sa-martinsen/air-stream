import Observable from '../index.mjs';
import { series } from '../../utils.mjs';

describe('constructor.mjs', () => {

  test('simple', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(3),
      evt => expect(evt).toEqual(4),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(1);
      emt(2);
      emt.kf();
      emt(3);
      emt(4);
    });

    source.on(done);

  });

  test('empty queue', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(1);
      emt(2);
      emt.kf();
      emt(3);
      emt(4);
      emt.kf();
    });

    source.on(done);

  });

  test('second subscriber after events', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(6),
      evt => expect(evt).toEqual(7),
    ]);

    const source = new Observable(emt => {
      emt.kf();
      emt(1);
      emt(2);
      emt(3);
      emt(4);
      emt(5);
      emt.kf();
      emt(6);
      emt(7);
    });

    source.on(() => {});

    setTimeout(() => source.on(done));

  });

  test('unsubscribe', (done) => {

    done = series(done, []);

    const source = new Observable(emt => {
      emt.kf();
      emt(1);
      emt(2);
      emt(3);
      emt(4);
      emt(5);
      emt.kf();
      emt(6);
      emt(7);
      // setTimeout(() => emt(8));
    });

    source.on(done)();

  });

  test('unsubscribe over time', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(6),
      evt => expect(evt).toEqual(7),
    ]);

    const source = new Observable(emt => {
      emt.kf();
      emt(1);
      emt(2);
      emt(3);
      emt(4);
      emt(5);
      emt.kf();
      emt(6);
      emt(7);
      // setTimeout(() => emt(8));
    });

    const uns = source.on(done);
    setTimeout(() => uns());

  });

});