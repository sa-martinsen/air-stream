import { stream2 as stream } from '../index';
import { streamEqualStrict } from '../../utils';

describe('merge', () => {
  test('merge', (done) => {

    const expected = [
      {
        data: { a: 1 }
      },
      {
        data: 12
      },
      {
        data: 21
      },
      {
        data: 13
      },
      {
        data: 22
      },
      {
        data: 14
      },
      {
        data: 23
      },
      {
        data: 24
      },
      {
        data: 25
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
    streamEqualStrict(done, merged, expected);

  });

});
