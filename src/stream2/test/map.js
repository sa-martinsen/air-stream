import {series} from "../../utils.mjs"
import { stream2 as stream } from "../../index.mjs";

describe('map', function () {

    test('simple', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( 31 ),
            evt => expect(evt).toEqual( 41 ),
        ]);

        const source = stream(null,  emt => {
            emt(3);
            emt(4);
        });

        source.map(x => x*10+1).on( done );

    });

});