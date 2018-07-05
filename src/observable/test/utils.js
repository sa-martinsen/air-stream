import {expect} from "chai";

export function series(done, assert) {
    if(!assert.length) setTimeout(done);
    let count = 0;
    let id;
    return function (...args) {
        if(assert[count] === undefined) {
            return expect(`count done test more then`).to.equal(count);
        }
        assert[count](...args);
        count++;
        assert.length === count && (id = setTimeout(done));
        if(count > assert.length) {
            clearTimeout(id);
            expect(`count done test`).to.equal(assert.length);
        }
    }
}