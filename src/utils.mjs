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

const deepEqual = function (x, y) {
  if (x === y) {
    return true;
  } else if ((typeof x == 'object' && x != null) && (typeof y == 'object' && y != null)) {
    if (Object.keys(x).length !== Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop]))
          return false;
      } else
        return false;
    }

    return true;
  } else
    return false;
};

export const streamEqual = (done, source, data = [], options = {}) => {
  const defaultOptions = {
    delta: 100, // ms
    timeout: null
  };

  expect.hasAssertions();

  options = { ...defaultOptions, ...options };
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const lastMsgTime = data.reduce((acc, msg) => msg.t > acc ? msg.t : acc, 0);
    jest.setTimeout(options.timeout || (lastMsgTime + options.delta));
    const doneTimer = setTimeout(() => {
      expect(data.some((assert) => !assert.pass)).toBeFalsy();
      resolve();
      done();
    }, lastMsgTime + options.delta);

    source.on(msg => {
      data.map((assert) => {
        if (!assert.pass) {
          const now = Date.now() - start;
          assert.pass = deepEqual(assert.data, msg) && Math.abs(assert.t - now) < options.delta;
        }
      });
    });
  });
};

export const streamEqualStrict = (done, source, data = [], options = {}) => {
  const defaultOptions = {
    delta: 100, // ms
    timeout: null
  };

  expect.assertions(data.length * 2);

  options = { ...defaultOptions, ...options };
  //return new Promise((resolve, reject) => {
    const start = Date.now();
    data = data.sort((a, b) => a.t - b.t);

    const lastMsgTime = data.reduce((acc, msg) => msg.t > acc ? msg.t : acc, 0);
    jest.setTimeout(options.timeout || (lastMsgTime + options.delta));

    const doneTimer = setTimeout(() => {
      //resolve();
      done();
    }, lastMsgTime + options.delta);

    return source.on(msg => {
      const assert = data.shift();
      if (typeof assert === 'undefined') {
        clearTimeout(doneTimer);
        //resolve();
        done();
      } else {
        const now = Date.now() - start;
        expect(assert.data).toEqual(msg);
        expect(Math.abs(assert.t - now)).toBeLessThanOrEqual(options.delta);
      }
    });
  //});
};
