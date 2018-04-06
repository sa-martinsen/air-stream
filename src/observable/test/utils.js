import {expect} from "chai";

export function series(done, assert) {
    let count = 0;
    let id;
    return function (...args) {
        assert[count](...args);
        count++;
        assert.length === count && (id = setTimeout(done));
        if(count > assert.length) {
            clearTimeout(id);
            expect(`count done test`).to.equal(assert.length);
        }
    }
}