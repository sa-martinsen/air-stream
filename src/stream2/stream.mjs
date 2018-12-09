import Reducer from "./reducer.mjs"
import Pipe from "./pipe.mjs"
import Accumulator from "./accumulator.mjs"
import Controller from "./controller.mjs"

export default (producer, { cached = false } = {}) => {
    const res = cached ? new Accumulator(producer) : new Pipe(producer);
    res.reduce = (initstream, project, options) => {
        return new Reducer(res, initstream, project, options);
    };
    res.controller = (stream, handler = x => x) => {
        if(typeof stream === "function") {
            handler = stream;
            stream = null;
        }
        return new Controller( this, stream, handler );
    };
    return res;
}