export function series (done, assert) {
  if (!assert.length) setTimeout(done);
  let count = 0;
  let id;
  return function (...args) {
    if (assert[count] === undefined) {
      return expect(count).toEqual(8);
    }
    assert[count](...args);
    count++;
    assert.length === count && (id = setTimeout(done));
    if (count > assert.length) {
      clearTimeout(id);
      expect(`count done test`).toEqual(assert.length);
    }
  };
}

export function equal(a, b) {
  if(a === b) {
    return true;
  }
  else {
    if(Array.isArray(a)) {
      return a.length === b.length && a.every( (a, i) => equal( a, b[i] ) );
    }
    else if(
      typeof a === "object" && a !== null && b !== null && a.constructor === Object
    ) {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      return keysA.length === keysB.length &&
        keysA.every( k => equal(a[k], b[k]) )
    }
    return false;
  }
}