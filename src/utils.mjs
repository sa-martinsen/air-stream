export function series(done, assert) {
    if(!assert.length) setTimeout(done);
    let count = 0;
    let id;
    return function (...args) {
        if(assert[count] === undefined) {
            return expect(count).toEqual(8);
        }
        assert[count](...args);
        count++;
        assert.length === count && (id = setTimeout(done));
        if(count > assert.length) {
            clearTimeout(id);
            expect(`count done test`).toEqual(assert.length);
        }
    }
}