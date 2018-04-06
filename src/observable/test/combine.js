import {expect} from "chai";
import Observable from "../index";
import {series} from "./utils"

describe('combine', function () {

    it('simple1', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal([1, 2]),
            evt => expect(evt).to.deep.equal([1, 3]),
            evt => expect(evt).to.deep.equal([4, 3]),
            evt => expect(evt).to.deep.equal([5, 3]),
            evt => expect(evt).to.deep.equal([5, 6]),
        ]);

        const source = new Observable(function (emt) {
            emt.emit({count: 1, path: "a"});
            emt.emit({count: 2, path: "b"});
            emt.emit({count: 3, path: "b"});
            emt.emit({count: 4, path: "a"});
            setTimeout( () => emt.emit({count: 5, path: "a"}) );
            setTimeout( () => emt.emit({count: 6, path: "b"}) );
        });

        let a = source.filter( ({path}) => path === "a" );
        let b = source.filter( ({path}) => path === "b" );

        Observable.combine([a, b], ({count: a}, {count: b}) => [a, b] ).on( done );

    });

});