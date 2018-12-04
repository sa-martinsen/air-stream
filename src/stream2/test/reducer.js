import {expect} from "chai"
import {stream, keyA, keyF} from "../index.mjs"
import {series} from "./../../utils.mjs"

describe('reducer', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 0 ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 6 ),
        ]);

        const initer = stream( ({ emt }) => {
            emt(10);
        } );

        const main = stream( ({ emt }) => {
            emt(0);
            emt(1);
            emt(2);
            emt(3);
        } );

        main
            .reducer( initer, (acc, next) => acc + next )
            .on( done );

    });
/*
    it('abort action', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 0 ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 5 ),
            evt => expect(evt).to.deep.equal( 9 ),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
            setTimeout(() => {
                emt(keyA, { is: { abort: true }, rid: 1 });
                emt(4, { rid: 4 });
            }, 0);
        } );

        source
            .reducer( (acc, next) => {
                return acc + next;
            } )
            .on( done );

    });*/
/*
    it('refresh history', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
            emt.kf();
            emt(keyA, { is: { abort: true }, rid: 1 });
        } );

        source
            .reducer( (acc, next) => {
                return acc + next;
            } )
            .on( done );

    });*/

});