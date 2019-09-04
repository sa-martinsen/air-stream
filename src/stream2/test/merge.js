import { stream2 as stream } from '../index';
import { streamEqual } from '../../utils';

describe('merge', () => {
  it('merge', (done) => {

    const expected = [
      {
        t: 0,
        data: { a: 1 }
      },
      {
        t: 200,
        data: 12
      },
      {
        t: 250,
        data: 21
      },
      {
        t: 300,
        data: 13
      },
      {
        t: 300,
        data: 22
      },
      {
        t: 400,
        data: 14
      },
      {
        t: 400,
        data: 23
      },
    ];

    const source1 = stream([], function (e) {
      e({ a: 1 });
      setTimeout(() => e(12), 200);
      setTimeout(() => e(13), 300);
      setTimeout(() => e(14), 400);
    });
    const source2 = stream([], function (e) {
      setTimeout(() => e(21), 250);
      setTimeout(() => e(22), 300);
      setTimeout(() => e(23), 400);
      setTimeout(() => e(24), 600);
      setTimeout(() => e(25), 700);
    });

    const merged = stream.merge([source1, source2]);
    streamEqual(done, merged, expected, { timeout: 10000 });

  });

});
