import {expect} from "chai";
import Observable from "../index.mjs";

describe('withLatestFrom', function () {

    it('simple1', (done) => {

        const source = new Observable(function (emt) {
            emt.emit({count: 2, path: "a"});
            emt.emit({weight: 3, path: "b"});
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
/*
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
*/
});