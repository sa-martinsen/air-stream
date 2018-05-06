import {expect} from "chai";
import Observable from "../index";
import {series} from "./utils"

describe('constructor', function () {

    it('with queue', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 2 ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 4 ),
            evt => expect(evt).to.deep.equal( 5 ),
        ]);

        const source = new Observable( emt => {
            emt(4);
            emt(5);
        }, [
            [Observable.keyF, { __sid__: -1 }],
            [1, { __sid__: -1 }],
            [2, { __sid__: -1 }],
            [3, { __sid__: -1 }],
        ]);

        source.on( done );

    });

});