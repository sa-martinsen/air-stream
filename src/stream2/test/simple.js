import { stream2 as stream } from '../index.mjs';
import { streamEqual, streamEqualStrict } from '../../utils';

describe('one stream', () => {
  it('strict', (done) => {
    const expected = [
      {
        t: 0,
        data: { a: 1 }
      },
      {
        t: 300,
        data: 3
      },
      {
        t: 400,
        data: 4
      },
      {
        t: 500,
        data: 2
      },
      {
        t: 200,
        data: 3.1
      },
    ];

    const source = stream([], function (e) {
      e({ a: 1 });
      setTimeout(() => e(2), 500);
      setTimeout(() => e(4), 400);
      setTimeout(() => e(3), 300);
      setTimeout(() => e(3.1), 200);
    });

    streamEqualStrict(done, source, expected);
  });

  it('not strict', (done) => {
    const expected = [
      {
        t: 100,
        data: 1
      },
      {
        t: 200,
        data: 2
      },
      {
        t: 300,
        data: 3
      },
    ];

    const source = stream([], function (e) {
      setTimeout(() => e(1), 100);
      setTimeout(() => e(2), 200);
      setTimeout(() => e(3), 300);
      setTimeout(() => e(4), 400);
      setTimeout(() => e(5), 500);
    });
    streamEqual(done, source, expected, { timeout: 10000 });
  });

});
