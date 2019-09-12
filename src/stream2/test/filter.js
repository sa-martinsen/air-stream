import {series} from "../../utils.mjs"
import { stream2 as stream } from "../../index.mjs"

describe('filter', function () {

    test('simple', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( 1 ),
            evt => expect(evt).toEqual( 5 ),
        ]);

        const source = new stream(null, function (emt) {
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
        });

        source
            .filter(x =>x % 2)
            .filter(x =>x % 3)
            .on( done );

    });

    // it('with reconnect', (done) => {
    //
    //     done = series(done, [
    //         evt => expect(evt).to.deep.equal( Observable.keyF ),
    //         evt => expect(evt).to.deep.equal( 5 ),
    //     ]);
    //
    //     const source = new Observable(function (emt) {
    //         emt.kf();
    //         emt(1);
    //         emt(2);
    //         emt(3);
    //         emt.kf();
    //         emt(4);
    //         emt(5);
    //     });
    //
    //     source
    //         .filter(x =>x % 2)
    //         .on( done );
    //
    // });

});