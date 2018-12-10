import {keyF, keys, MERT} from "./defs.mjs"
import { Pipe } from "./index.mjs"
import Action from "./action.mjs"
import perfomance from "./perfomance.mjs"

class AccAction extends Action {

    exec() {
        super.exec();
        if(this.evt[0] !== keyF) {
            this.src.__acc.push(this);
        }
    }

}

export default class Accumulator extends Pipe {

    constructor(producer) {
        super(producer);
        this.__acc = [];
    }

    /**
     * @param {Function} observer
     * @override
     */
    registerObserver(observer) {
        super.registerObserver(observer);
        const lasted = perfomance() - MERT;
        this.__acc = this.__acc.slice(
            //if not exist -1 - last
            //else - from last index
            this.__acc.findIndex( ({ stack: { ttmp } }) => ttmp >= lasted )
        );
        this.__acc.map( ({ evt }) => observer( ...evt ) );
    }

    /**
     * @param parms
     * @returns {AccAction}
     * @override
     */
    createAction(parms) {
        return new AccAction( this, parms );
    }

    emit(data, src) {
        if(data === keyF) this.__acc.length = 0;
        super.emit(data, src);
    }

    /**
     *
     * @param {Array.<Pipe>} streams
     * @param {Function} project
     * @returns {Pipe}
     */
    withLatest(streams, project = x => x) {
        if(streams.some(stream => !(stream instanceof Accumulator)))
            return super.withLatest(streams, project);
        return new Accumulator( ({ emt, req }) => {
            const buffer = new Array(streams.length);
            const sync = (stream, evt, src, i) => {
                buffer[i] = evt;
            };
            req.on( (evt, src) => {
                if(evt === keyF) {
                    if(buffer.every(x => x)) {
                        emt(evt, src);
                    }
                }
                else if(keys(evt)) {
                    emt(evt, src);
                }
                else {
                    if(buffer.every(x => x && x !== keyF)) {
                        emt(evt, src);
                    }
                }
            } );
            streams.map( (stream, i) =>
                req.on( stream.on((evt, src) => {
                    if(evt !== keyF && keys(evt)) emt(evt, src);
                    sync(stream, evt, src, i)
                }) )
            );
        } );
    }

    map(project) {
        return super.map( project, Accumulator );
    }

    distinct(predicate) {
        return super.distinct( predicate, Accumulator );
    }

}