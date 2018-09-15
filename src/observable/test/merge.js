import {describe, it} from "mocha"
import { merge, stream, keyF } from "../../index.mjs"
import {expect} from "chai"
import {series} from "./utils"

describe('merge', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.equal( "a1" ),
            evt => expect(evt).to.equal( "b2" ),
            evt => expect(evt).to.equal( "c3" ),
            evt => expect(evt).to.equal( "d4" ),
        ]);

        const source = stream( emt => {
            emt("a1");
            emt("b2");
            emt("c3");
            emt("d4");
        } );

        const res = merge([source.filter(x => x[1]%2)], [source.filter(x => !(x[1]%2))]);
        res.on( done );

    });

    it('without connectable', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.equal( "b2" ),
            evt => expect(evt).to.equal( "d4" ),
        ]);

        const source = stream( emt => {
            emt("a1");
            emt("b2");
            emt("c3");
            emt("d4");
        } );

        const res = merge([], [source.filter(x => !(x[1]%2))]);
        res.on( done );

    });

    it('without unconnectable', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.equal( "a1" ),
            evt => expect(evt).to.equal( "b2" ),
            evt => expect(evt).to.equal( "c3" ),
            evt => expect(evt).to.equal( "d4" ),
        ]);

        const source = stream( emt => {
            emt("a1");
            emt("b2");
            emt("c3");
            emt("d4");
        } );

        const res = merge([source.filter(x => x[1]%2), source.filter(x => !(x[1]%2))], []);
        res.on( done );

    });

});