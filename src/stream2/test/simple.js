import { stream2 as stream } from '../index.mjs';
import { streamEqual, streamEqualStrict } from '../../utils';

describe('one stream', () => {
  test('strict', (done) => {
    const expected = [
      { data: { a: 1 } },
      { data: 3 },
      { data: 4 },
      { data: 2 },
      { data: 3.1 },
    ];

    const source = stream([], function (e) {
      e({ a: 1 });
      e(3);
      e(4);
      e(2);
      e(3.1);
    });

    streamEqualStrict(done, source, expected);
  });

  test('not strict', (done) => {
    const expected = [
      { data: 1 },
      { data: 2 },
      { data: 3 },
    ];

    const source = stream([], function (e) {
      e(1);
      e(2);
      e(3);
      e(4);
      e(5);
    });
    streamEqual(done, source, expected);
  });

  test('log', function (done) {
    const source = new stream(null, function (emt) {
      emt({count: 2, path: "a"});
      emt({acc: 4, path: "c"});
      emt({weight: 3, path: "b"});
    });
    source.log();
    done();
  });

  // test('unsubscribe', (done) => {
  //   const source = stream(null, function (emt) {
  //     emt({type: "reinit", weight: 2, path: "a"});
  //     emt({type: "reinit", weight: 3, path: "a"});
  //     emt({type: "reinit", weight: 3, path: "b"});
  //     emt({type: "reinit", weight: 4, path: "a"});
  //     return done;
  //   });
  //   let a = source
  //       .filter( ({path}) => path === "a" )
  //       .map( ({weight, ...args}) => ({weight: weight + "77", ...args}) );
  //   let obs = a.on( evt => {} );
  //   obs();
  //   expect(!source.obs.length).toEqual( 0 );
  // });
});
