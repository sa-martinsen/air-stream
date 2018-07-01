import {expect} from "chai";
import Observable, {combine} from "../index.js"
import {series} from "./utils.js"

describe('combine', function () {

    it('simple1', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal(Observable.keyF),
            evt => expect(evt).to.deep.equal([1, 2]),
            evt => expect(evt).to.deep.equal([1, 3]),
            evt => expect(evt).to.deep.equal([4, 3]),
            evt => expect(evt).to.deep.equal([5, 3]),
            evt => expect(evt).to.deep.equal([5, 6]),
        ]);

        const source = new Observable(function (emt) {
            emt({count: 1, path: "a"});
            emt({count: 2, path: "b"});
            emt({count: 3, path: "b"});
            emt({count: 4, path: "a"});
            setTimeout( () => emt({count: 5, path: "a"}) );
            setTimeout( () => emt({count: 6, path: "b"}) );
        });

        const a = source.filter( ({path}) => path === "a" );
        const b = source.filter( ({path}) => path === "b" );

        combine([a, b], ({count: a}, {count: b}) => [a, b] ).on( done );

    });

    it('combine key', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal(Observable.keyF),
        ]);

        const source = new Observable(function (emt) {
            emt.kf();
        });

        const a = source.filter( ({path}) => path === "a" );
        const b = source.filter( ({path}) => path === "b" );

        combine([a, b], ({count: a}, {count: b}) => [a, b] ).on( done );

    });

    it('combine dbl key', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal(Observable.keyF),
            evt => expect(evt).to.deep.equal(["b", "a"]),
        ]);

        const source1 = new Observable(function (emt) {
            emt.kf();
            emt.kf();
            emt( 'b' );
        });

        const source2 = new Observable(function (emt) {
            setTimeout( () => emt( "a" ) )
        });

        combine([source1, source2] ).on( done );

    });

    it('several observers', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal(Observable.keyF),
            evt => expect(evt).to.deep.equal(["b", "0"]),
            evt => expect(evt).to.deep.equal(["b", "1"]),
            evt => expect(evt).to.deep.equal(["c", "1"]),
        ]);

        const source1 = new Observable(function (emt) {
            emt.kf();
            emt.kf();
            emt( 'b' );
            setTimeout( () => emt( "c" ), 20 );
        });

        const source2 = new Observable(function (emt) {
            emt.kf();
            emt("0");
            emt("1");
        });

        source1.on( () => {} );
        source2.on( () => {} );

        const res = combine([ source1, source2] );
        setTimeout( () => {
            res.on( done );
        }, 20 );


    });

});