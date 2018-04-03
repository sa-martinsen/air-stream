import {expect} from "chai";
import Observable from "../index";
import {describe, it} from "mocha";

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

    describe('constructor', function () {

        const source = new Observable(function (emt) {
            emt.emit({type: "reinit"});
            emt.emit({type: "change"});
        });

        let index = 0;

        it('simple', (done) => {
            source.on(evt => {
                expect(evt).to.containSubset([{type: "reinit"}, {type: "change"}][index]);
                index++;
                if(index === 2) done();
            });
        });

    });

    describe('map', function () {

        const source = new Observable(function (emt) {
            emt.emit({type: "reinit", count: 1});
            emt.emit({type: "change", count: 2});
        });

        let index = 0;

        it('simple', (done) => {
            source.map(({type, count}) => ({type, count: count+1})).on(evt => {
                expect(evt).to.containSubset([
                    {type: "reinit", count: 2},
                    {type: "change", count: 3}
                ][index]);
                index++;
                if(index === 2) done();
            });
        });

    });

    describe('filter', function () {

        const source = new Observable(function (emt) {
            emt.emit({type: "reinit", count: 1});
            emt.emit({type: "change", count: 2});
            emt.emit({type: "change", count: 3});
        });

        let index = 0;

        it('simple', (done) => {
            source.filter(({count}) => count % 2).on(evt => {
                expect(evt).to.containSubset([
                    {type: "reinit", count: 1},
                    {type: "change", count: 3}
                ][index]);
                index++;
                if(index === 2) done();
            });
        });

        it('filter when one source', (done) => {

            let index = 0;

            const source = new Observable(function (emt) {
                emt.emit({type: "reinit", count: 1, path: "a"});
                emt.emit({type: "reinit", weight: 2, path: "b"});
            });

            let a = source.filter( ({path}) => path === "a" );
            let b = source.filter( ({path}) => path === "b" );

            a.on(evt => {
                expect(evt).to.containSubset( {type: "reinit", count: 1, path: "a"} );
                index++;
                if(index === 2) done();
            });

            b.on(evt => {
                expect(evt).to.containSubset( {type: "reinit", weight: 2, path: "b"} );
                index++;
                if(index === 2) done();
            });

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