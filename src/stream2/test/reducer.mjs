import {expect} from "chai"
import Reducer from "../reducer.mjs"
import Pipe from "../pipe.mjs"
import {series} from "./../../utils.mjs"
import {keyA, keyF} from "../defs.mjs"
const st = setTimeout;

describe('reduce', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( 15 ),
            evt => expect(evt).to.deep.equal( 19 ),
        ]);

        const eventstream = new Pipe(({ emt }) => {
            emt(2, { sid: 1 });
            emt(3, { sid: 2 });
            emt(4, { sid: 3 });
        });

        const initstream = new Pipe(({ emt }) => {
            emt(10, { sid: 0 });
        });

        new Reducer( eventstream, initstream, (acc, cur) => acc + cur, { free: true } )
            .on( done );

    });


    it('post events', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( 15 ),
            evt => expect(evt).to.deep.equal( 19 ),
        ]);

        const eventstream = new Pipe(({ emt }) => {
            st( () => emt(2), 0 );
            st( () => emt(3), 10 );
            st( () => emt(4), 20 );
        });

        const initstream = new Pipe(({ emt }) => {
            emt(10);
        });

        new Reducer( eventstream, initstream, (acc, cur) => acc + cur, { free: true } )
            .on( done );

    });


    it('abort action', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( 15 ),
            evt => expect(evt).to.deep.equal( 19 ),
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( 16 ),
        ]);

        const eventstream = new Pipe(({ emt }) => {
            st( () => emt(2), 0 );
            st( () => emt(3), 10 );
            st( () => emt(4), 20 );
        });

        const initstream = new Pipe(({ emt, req }) => {
            emt(10);
            req.on(({ rid, conformation }) => {
                if(conformation === 3) {
                    st(() => emt(keyA, {rid, is: {aborted: true}}), 30);
                }
            });
        });

        new Reducer( eventstream, initstream, (acc, cur) => acc + cur )
            .on( done );

    });


    it('immediate action abort', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 13 ),
            evt => expect(evt).to.deep.equal( 17 ),
        ]);

        const eventstream = new Pipe(({ emt }) => {
            st( () => emt(2), 0 );
            st( () => emt(3), 10 );
            st( () => emt(4), 20 );
        });

        const initstream = new Pipe(({ emt, req }) => {
            emt(10);
            req.on(({ rid, conformation }) => {
                if(conformation === 2) {
                    emt(keyA, {rid, is: {aborted: true}});
                }
            });
        });

        new Reducer( eventstream, initstream, (acc, cur) => acc + cur )
            .on( done );

    });


    it('confirm action', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 10 ),
            evt => expect(evt).to.deep.equal( 12 ),
            evt => expect(evt).to.deep.equal( 15 ),
            evt => expect(evt).to.deep.equal( 19 ),
        ]);

        const eventstream = new Pipe(({ emt }) => {
            st( () => emt(2), 0 );
            st( () => emt(3), 10 );
            st( () => emt(4), 20 );
        });

        const initstream = new Pipe(({ emt, req }) => {
            emt(10);
            req.on( ({ rid, conformation }) => {
                if(conformation === 3) {
                    st( () => emt(keyA, {rid, is: { confirmed: true }}), 30 );
                }
            } );
        });

        new Reducer( eventstream, initstream, (acc, cur) => acc + cur )
            .on( done );

    });

/**/});