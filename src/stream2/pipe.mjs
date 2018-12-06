import perfomance from "./perfomance.mjs"
import Emitter from "./emitter.mjs"
import Handler from "./handler.mjs"
import {keyA, keyF} from "./defs.mjs"
import Stack, { stacks } from "./stack.mjs"
import { queue } from "./queue.mjs"
import Action from "./action.mjs"

export default class Pipe {

    /**
     *
     * @param {Function} producer
     * @param {Boolean} adjective
     */
    constructor( producer, { adjective = true } = {} ) {
        this.adjective = true;
        /*<@>*/ if(typeof producer !== "function") throw `first argument 'creator' must be a function`; /*</@>*/
        this._createdttmp = perfomance();
        this._producer = producer;
        this._observers = [];
        this._processed = [];
        this._emitter = null;
    }

    /**
     *
     * @param {Function} observer
     * @returns {Function}
     */
    on(observer) {
        /*<@>*/ if(typeof observer !== "function") throw `first argument 'obs' must be a function`; /*</@>*/
        if(!this._emitter) {
            this._handler = new Handler();
            this._emitter = new Emitter( this );
        }
        this.registerObserver(observer);
        return ( { request, ...args } = { request: "disconnect" } ) => {
            if(request === "disconnect") {
                const cut = this._observers.indexOf(observer);
                /*<@>*/if(cut < 0) throw `attempt to delete an observer out of the container`;/*</@>*/
                this._observers.splice(cut, 1);
                if(!this._observers.length) {
                    this._handler.request( { request } );
                    this._emitter = null;
                    this._handler = null;
                }
            }
            else {
                this._handler.request( { request, ...args } );
            }
        }
    }

    registerObserver(observer) {
        this._observers.push(observer);
    }

    /**
     * @param {*} data
     * @param {Number} sid
     * @param {Object} is
     * @param {Number} rid
     */
    emit(data, { sid = stacks.length, is = null, rid = -1 } = {}) {

        if(is) data = keyA;
        /*<@>*/if(data === keyA && !is) throw `'keyA' system event doesn't support empty 'is' state`;/*</@>*/

        if(data === undefined && !this._initialize) {
            data = keyF;
        }

        /*<@>*/if(data === undefined) throw `attempt to emit 'undefined' data`;/*</@>*/

        const stack = stacks[ sid ] || (stacks[ sid ] = new Stack({ sid, queue }));

        if(!this._initialize && data !== keyF) {
            this.emit(keyF, { sid });
        }

        this._initialize = true;

        if(data === keyF) {
            this.acc = undefined;
            this.clearProcessed();
        }

        this
            .createAction({ evt: [data, { sid, is, rid, ttmp: stack.ttmp }], stack })
            .activate();

    }

    /**
     *
     * @param parms
     * @returns {Action}
     */
    createAction(parms) {
        return new Action( this, parms );
    }

    clearProcessed() {
        this._processed.map( ({ stack, act }) => stack.cuts(act) );
        this._processed.length = 0;
    }

}