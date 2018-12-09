import { expect } from "chai"
import { stream, Pipe, keyF } from "../index.mjs"
import { series } from "../../utils.mjs"
import { describe, it } from "mocha"
const st = setTimeout;

describe('constructor', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 4 ),
        ]);

        new Pipe( ({ emt }) => {
            emt( 3 );
            emt( 4 );
        } ).on(done);

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


    it('second subscriber after events with pipe', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
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

        st(() => source.on( done ));

    });


    it('second subscriber after events with acc', (done) => {

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
        }, { cached: true });

        source.on( () => {} );

        st(() => source.on( done ));

    });


    it('unsubscribe', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
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
            st( () => emt(8) );
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
            st( () => emt(8) );
        });

        const uns = source.on( done );
        st(() => uns());

    });


    it('when cache time is up', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 7 ),
        ]);

        const source = stream( ({ emt }) => {
            emt(7);
        }, { cached: true });

        source.on( () => {} );

        st( () => source.on(done), 400 );

    });


    it('when cache time is up, after msg', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 8 ),
            evt => expect(evt).to.deep.equal( 9 ),
        ]);

        const source = stream( ({ emt }) => {
            emt(7);
            st( () => emt(8), 350 );
            st( () => emt(9), 350 );
        }, { cached: true });

        source.on( () => {} );

        st( () => source.on(done), 400 );

    });


});