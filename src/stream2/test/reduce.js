import { Reducer, stream2 as stream } from "../index.mjs";
import { streamEqualStrict } from '../../utils';

describe('reduce', function () {

    test('clear reducer construct with initialized stream', (done) => {
        const state = stream( [], function (e) {
            setTimeout(() => e({ready: true}), 10);
        } );
        const reducer = new Reducer(null, null, state);
        streamEqualStrict(done, reducer, [
            {t: 10, data: {ready: true}}
        ]);
    });

});