import { stream2 as stream } from '../index';
import { streamEqualStrict } from '../../utils';

describe('combine', () => {
    it('simple', (done) => {
        const expected = [
            {
                t: 0,
                data: [{ a: 1 }, undefined]
            },
            {
                t: 200,
                data: [2, undefined]
            },
            {
                t: 250,
                data: [2, 1]
            },
            {
                t: 300,
                data: [3, 1]
            },
            {
                t: 300,
                data: [3, 2]
            },
            {
                t: 400,
                data: [4, 2]
            },
        ];

        const source1 = stream([], function (e) {
            e({ a: 1 });
            setTimeout(() => e(2), 200);
            setTimeout(() => e(3), 300);
            setTimeout(() => e(4), 400);
        });
        const source2 = stream([], function (e) {
            setTimeout(() => e(1), 250);
            setTimeout(() => e(2), 300);
            setTimeout(() => e(3), 400);
        });

        const combined = stream.combine([source1, source2]);
        streamEqualStrict(done, combined, expected);
    });
});
