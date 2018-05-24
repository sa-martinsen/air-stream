import {expect} from "chai";
import Observable from "../index";
import {series} from "./utils"

describe('service', function () {

    it('simple1', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 0 ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 2 ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 0 ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 3 ),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
            emt( Observable.keyA, { rid: 2, is: {err: true} });
            return ( { request = [] } ) => {
                request.map( req => emt( ...req ) );
            }
        } );

        source
            .service( )
            .on( done );

    });

});