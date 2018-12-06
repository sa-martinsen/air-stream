import { Pipe } from "./index.mjs"
import Action from "./action.mjs"
import perfomance from "./perfomance.mjs"
import {keyF, keys, MERT} from "./defs.mjs"

class AccAction extends Action {

    exec() {
        super.exec();
        this.src.__acc.push(this);
        if(this.src.__acc.length > 1) {
            if(this.src.__acc[0].stack.ttmp < perfomance() - MERT) {
                this.src.__acc.shift();
            }
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

    /**
     *
     * @param {Array.<Pipe>} streams
     * @param {Function} project
     * @returns {Pipe}
     */
    static combine(streams, project = x => x) {
        return new Pipe( ({ emt, req }) => {
            const buffer = new Array(streams.length);
            const sync = (stream, evt, src, i) => {
                buffer[i] = evt;
                if(buffer.every(x => x)) {
                    if(buffer.some(x => x === keyF)) {
                        emt( keyF, src );
                    }
                    else {
                        emt( project(buffer, src), src );
                    }
                }
            };
            streams.map( (stream, i) =>
                req.on( stream.on((evt, src) => {
                    if(evt !== keyF && keys(evt)) emt(evt, src);
                    else sync(stream, evt, src, i);
                }) )
            );
        } );
    }

    /**
     *
     * @param {Array.<Pipe>} streams
     * @param {Function} project
     * @returns {Pipe}
     */
    withLatest(streams, project = x => x) {
        return new Pipe( ({ emt, req }) => {
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