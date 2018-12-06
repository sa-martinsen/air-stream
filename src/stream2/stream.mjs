import Reducer from "./reducer.mjs"
import Pipe from "./pipe.mjs"
import Accumulator from "./accumulator.mjs"

export default (producer, { cacheble = false }) => {
    const res = cacheble ? new Accumulator(producer) : new Pipe(producer);
    res.reduce = (initstream, project, options) =>
        new Reducer(res, initstream, project, options);
    return res;
}