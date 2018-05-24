import {describe, it} from "mocha";
import Observable from "../index";
import {expect} from "chai";
import {series} from "./utils";

describe('filter', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 5 ),
        ]);

        const source = new Observable(function (emt) {
            emt.kf();
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

    it('with reconnect', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( Observable.keyF ),
            evt => expect(evt).to.deep.equal( 5 ),
        ]);

        const source = new Observable(function (emt) {
            emt.kf();
            emt(1);
            emt(2);
            emt(3);
            emt.kf();
            emt(4);
            emt(5);
        });

        source
            .filter(x =>x % 2)
            .on( done );

    });

});