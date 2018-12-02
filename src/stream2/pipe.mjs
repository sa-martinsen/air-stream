import perfomance from "./perfomance.mjs"
import Emitter from "./emitter.mjs"
import Handler from "./handler.mjs"

export default class Pipe {

    /**
     *
     * @param {Function} producer
     */
    constructor( producer ) {
        /*<@>*/ if(typeof creator !== "function") throw `first argument 'creator' must be a function`; /*</@>*/
        this._createdttmp = perfomance();
        this._producer = producer;
        this._observers = [];
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
        this._observers.push(observer);
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

    emit() {

    }


}