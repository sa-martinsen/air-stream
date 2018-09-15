import {expect} from "chai"
import {series} from "./utils.js"
import { stream } from "../../index.mjs"

describe('controller', function () {

    it('simple1', (done) => {
        const source = stream(({kf}, {hook}) => {
            kf();
            hook.add( series(done, [
                evt => expect(evt).to.deep.equal({dissolve: false, w: 11}),
            ]))
        });
        const cb = source.controller( ({w}) => ({w: w + 1 }) ).on(
            evt => cb({ w: 10 })
        );
    });

});