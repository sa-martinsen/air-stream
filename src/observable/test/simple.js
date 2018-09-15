import {expect} from "chai";
import Observable from "../index.mjs";
import {describe, it} from "mocha";
import {series} from "./utils";

function pusher(sequence) {
    return data => sequence.push(data);
}

describe('Observable', function () {

    describe('log', function () {

        const source = new Observable(function (emt) {
            emt.emit({count: 2, path: "a"});
            emt.emit({acc: 4, path: "c"});
            emt.emit({weight: 3, path: "b"});
        });

        it('simple', (done) => {
            source.log();
            done();
        });

    });

    describe('combination', function () {

        it('unsubscribe', (done) => {
            const source = new Observable(function (emt) {
                emt.emit({type: "reinit", weight: 2, path: "a"});
                emt.emit({type: "reinit", weight: 3, path: "a"});
                emt.emit({type: "reinit", weight: 3, path: "b"});
                emt.emit({type: "reinit", weight: 4, path: "a"});
                return done;
            });
            let a = source
                .filter( ({path}) => path === "a" )
                .map( ({weight, ...args}) => ({weight: weight + "77", ...args}) );
            let obs = a.on( evt => {} );
            obs();
            expect(!source.obs.length).to.equal( 0 );
        });

    });

});