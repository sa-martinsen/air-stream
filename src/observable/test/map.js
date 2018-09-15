import {describe, it} from "mocha";
import Observable from "../index.mjs";
import {expect} from "chai";
import {series} from "./utils";

describe('map', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 31 ),
            evt => expect(evt).to.deep.equal( 41 ),
        ]);

        const source = new Observable( emt => {
            emt.kf();
            emt(1);
            emt(2);
            emt.kf();
            emt(3);
            emt(4);
        });

        source.map(x => x*10+1).on( done );

    });

});