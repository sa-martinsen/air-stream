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
            emt({count: 1, path: "a"});
            emt({count: 2, path: "b"});
            emt({count: 3, path: "b"});
            emt({count: 4, path: "a"});
            setTimeout( () => emt({count: 5, path: "a"}) );
            setTimeout( () => emt({count: 6, path: "b"}) );
        });

        let a = source.filter( ({path}) => path === "a" );
        let b = source.filter( ({path}) => path === "b" );

        Observable.combine([a, b], ({count: a}, {count: b}) => [a, b] ).on( done );

    });

});