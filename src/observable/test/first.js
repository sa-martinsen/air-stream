import {expect} from "chai";
import {describe, it} from "mocha";
import Observable from "../index.mjs";
import {series} from "./utils";

describe('first', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.equal(Observable.keyF),
            evt => expect(evt).to.equal(1)
        ]);

        const source = new Observable(function (emt) {
            emt.emit(1);
            emt.emit(2);
            emt.emit(3);
        }).first();

        source.on(done);
    });

    it('with combine()', (done) => {

        done = series(done, [
            evt => expect(evt).to.equal(Observable.keyF),
            evt => expect(evt).to.deep.equal([3, 3])
        ]);

        const a = new Observable(function (emt) {
            emt(1);
            emt(2);
            emt(3);
        });

        const b = new Observable(function (emt) {
            emt(3);
            emt(4);
            emt(5);
        });

        Observable.combine([a, b]).first().on(done);

    });

});