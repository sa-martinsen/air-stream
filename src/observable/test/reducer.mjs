import Observable, { keyA, keyF } from '../index.mjs';
import { series } from './../../utils.mjs';

describe('reducer', () => {

  test('simple1', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(Observable.keyF),
      evt => expect(evt).toEqual(0),
      evt => expect(evt).toEqual(1),
      evt => expect(evt).toEqual(3),
      evt => expect(evt).toEqual(6),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(0, { rid: 0 });
      emt(1, { rid: 1 });
      emt(2, { rid: 2 });
      emt(3, { rid: 3 });
    });

    source
      .reducer((acc, next) => {
        return acc + next;
      })
      .on(done);

  });

  test('abort action', (done) => {

    done = series(done, [
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toEqual(0),
      evt => expect(evt).toEqual(1),
      evt => expect(evt).toEqual(3),
      evt => expect(evt).toEqual(6),
      evt => expect(evt).toEqual(keyF),
      evt => expect(evt).toEqual(2),
      evt => expect(evt).toEqual(5),
    ]);

    const source = new Observable(function (emt) {
      emt.kf();
      emt(0, { rid: 0 });
      emt(1, { rid: 1 });
      emt(2, { rid: 2 });
      emt(3, { rid: 3 });
      setTimeout(() => {
        emt(keyA, { is: { abort: true }, rid: 1 });
        emt(4, { rid: 4 });
      }, 0);
    });

    source
      .reducer((acc, next) => {
        return acc + next;
      })
      .on(done);

  });
  /*
      it('refresh history', (done) => {

          done = series(done, [
              evt => expect(evt).toEqual( keyF ),
          ]);

          const source = new Observable( function (emt) {
              emt.kf();
              emt(0, { rid: 0 });
              emt(1, { rid: 1 });
              emt(2, { rid: 2 });
              emt(3, { rid: 3 });
              emt.kf();
              emt(keyA, { is: { abort: true }, rid: 1 });
          } );

          source
              .reducer( (acc, next) => {
                  return acc + next;
              } )
              .on( done );

      });*/

});