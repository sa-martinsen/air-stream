import {expect} from "chai";
import { stream2 } from "../index.mjs";
import {series} from "../../utils.mjs"

describe('constructor', function () {

    test('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 2 ),
        ]);

        const source = stream2([], function (e) {
	        e( 1 );
	        e( 2 );
        });

        source.on(done);

    });
/*
    it('empty queue', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
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

    it('second subscriber after events', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( 7 ),
        ]);

        const source = new Observable( emt => {
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

        source.on( () => {} );

        setTimeout(() => source.on( done ));

    });
*/
    test('unsubscribe', (done) => {

        done = series(done, [
	        evt => expect(evt).to.deep.equal( 1 ),
        ]);

        const source = stream2( [], e => {
            e(1);
            setTimeout( () => e(2) );
        });

        source.on( done )();

    });
/*
    it('unsubscribe over time', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( 7 ),
        ]);

        const source = new Observable( emt => {
            emt.kf();
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
            emt.kf();
            emt(6);
            emt(7);
            setTimeout( () => emt(8) );
        });

        const uns = source.on( done );
        setTimeout(() => uns());

    });*/

});