import { expect } from "chai";
import { stream, keyF } from "../index.mjs";
import { series } from "../../utils.mjs"
import { describe, it } from "mocha";

describe('constructor', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 4 ),
        ]);

        const source = stream(({ emt, kf }) => {
            kf();
            emt(1);
            emt(2);
            kf();
            emt(3);
            emt(4);
        });

        source.on(done);

    });

    it('empty queue', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
        ]);

        const source = stream(({ emt, kf }) => {
            kf();
            emt(1);
            emt(2);
            kf();
            emt(3);
            emt(4);
            kf();
        });

        source.on(done);

    });

    it('second subscriber after events', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( 7 ),
        ]);

        const source = stream( ({ emt, kf }) => {
            kf();
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
            kf();
            emt(6);
            emt(7);
        });

        source.on( () => {} );

        setTimeout(() => source.on( done ));

    });

    it('unsubscribe', (done) => {

        done = series(done, [ ]);

        const source = stream( ({ emt, kf }) => {
            kf();
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
            kf();
            emt(6);
            emt(7);
            setTimeout( () => emt(8) );
        });

        source.on( done )();

    });

    it('unsubscribe over time', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( 7 ),
        ]);

        const source = stream( ({ emt, kf }) => {
            kf();
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
            kf();
            emt(6);
            emt(7);
            setTimeout( () => emt(8) );
        });

        const uns = source.on( done );
        setTimeout(() => uns());

    });

});