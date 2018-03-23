import {assert, expect} from 'chai';
import {it, describe} from "mocha"
import Observable from "./index"

function pusher(sequence) {
    return data => sequence.push(data);
}

describe('Observable', function () {

    describe('log', function () {

        const source = new Observable(function (emt) {
            emt.emit({type: "reinit", count: 2, path: "a"});
            emt.emit({type: "reinit", acc: 4, path: "c"});
            emt.emit({type: "reinit", weight: 3, path: "b"});
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

    describe('withLatestFrom', function () {

        it('simple1', (done) => {

            const source = new Observable(function (emt) {
                emt.emit({count: 2, path: "a"}, {type: "reinit"});
                emt.emit({weight: 3, path: "b"}, {type: "reinit"});
            });

            let a = source.filter( ({path}) => path === "a" );
            let b = source.filter( ({path}) => path === "b" );

            let index = 0;

            b.withLatestFrom([a], ({type, weight, path, ...args}, {count}) =>
                ({type, ...args, total: weight * count})).on(evt => {
                expect(evt).to.containSubset([
                    {total: 6},
                ][index]);
                index++;
                if(index === 1) done();
            });
        });

        it('simple2', (done) => {
            const source = new Observable(function (emt) {
                emt.emit({ count: 2, path: "a"}, {type: "reinit"});
                emt.emit({ acc: 4, path: "c"}, {type: "reinit"});
                emt.emit({ weight: 3, path: "b"}, {type: "reinit"});
            });
            let a = source.filter( ({path}) => path === "a" );
            let b = source.filter( ({path}) => path === "b" );
            let c = source.filter( ({path}) => path === "c" );
            let index = 0;
            b.withLatestFrom([a, c], ({type, weight, path, ...args}, {count}, {acc}) =>
                ({type, ...args, total: weight * count * acc})).on(evt => {
                expect(evt).to.containSubset([
                    {total: 24},
                ][index]);
                index++;
                if(index === 1) done();
            });
        });

        it('self-loop', (done) => {

            const source = new Observable(function (emt) {
                emt.emit({ weight: 2, path: "a"}, { type: "reinit" });
                emt.emit({ weight: 3, path: "a"}, { type: "reinit" });
                emt.emit({ weight: 4, path: "a"}, { type: "reinit" });
            });

            let a = source.filter( ({path}) => path === "a" );
            let b = source.filter( ({path}) => path === "a" );
            let c = source.filter( ({path}) => path === "a" );

            let index = 0;

            b.withLatestFrom([a, c, b], ({type, weight: a, path, ...args}, {weight: b}, {weight: c}, {weight: d}) =>
                ({type, ...args, total: a * b * c * d})).on(evt => {
                expect(evt).to.containSubset([
                    { total: 256 },
                ][index]);
                index++;
                if(index === 1) done();
            });
        });

        it('unsubscribe', (done) => {
            const source = new Observable(function (emt) {
                emt.emit({ weight: 2, path: "a"});
                emt.emit({ weight: 3, path: "a"});
                emt.emit({ weight: 3, path: "b"});
                emt.emit({ weight: 4, path: "a"});
                return done;
            });

            let a = source.filter( ({path}) => path === "a" );
            let b = source.filter( ({path}) => path === "a" );
            let c = source.filter( ({path}) => path === "a" );

            let obs = b.withLatestFrom([a, c, b], ({type, weight: a, path, ...args}) =>
                ({type, ...args})).on( e => {} );
            obs();
            expect(!source.obs.length).to.equal( 0 );
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