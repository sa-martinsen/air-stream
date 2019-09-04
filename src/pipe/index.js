import globals from "../observable/globals";
import Stack from "../observable/stack";
import {empty, keyA, keyF} from "../observable/index";

const EMPTY_OBJ = {};

export class Stream {

    constructor (constructor) {
        this.observers = [];
        this.constructor = constructor;
    }

    connect( observer ) {
        const controller = new Controller();
        const emitter = new Emitter( observer );
        const over = this.constructor( (data, src) => emitter.event( data, src ), controller );
        over && controller.over( over );
        this.observers.push( observer );
        return ( request = "disconnect", data = EMPTY_OBJ ) => {
            controller.hook(request, data);
            const observersIndexOf = this.observers.indexOf( observer );
            /*<@debug>*/
            if(observersIndexOf === -1) {
                throw "observer not found";
            }
            /*</@debug>*/
            this.observers.splice( observersIndexOf, 1 );
        }
    }

}

export class Reducer {

    constructor (constructor) {
        this.observers = [];
        this.constructor = constructor;
        this.emitter = null;
        this.controller = null;
    }

    connect( observer ) {
        if(!this.observers.length) {
            this.controller = new Controller();
            this.emitter = new Emitter( this );
            const over = this.constructor( (data, src) => this.emitter.event( data, src ), this.controller );
            over && this.controller.over( over );
        }
        this.observers.push( observer );
        return ( request = "disconnect", data = EMPTY_OBJ ) => {
            if( request === "disconnect") {
                if(this.observers.length === 1) {
                    this.controller.hook(request, data);
                }
                const observersIndexOf = this.observers.indexOf( observer );
                /*<@debug>*/
                if(observersIndexOf === -1) {
                    throw "observer not found";
                }
                /*</@debug>*/
                this.observers.splice( observersIndexOf, 1 );
            }
            else {
                this.controller.hook(request, data);
            }
        }
    }

}

export class Emitter {

    constructor( observer ) {
        this.observer = observer;
    }

    event() {

    }

}

export class Controller {

    constructor() {
        this.over = [];
        this.disconnected = [];
        this.requested = new Map();
    }

    disconnect( handler ) {
        this.disconnected.push( handler );
    }

    handle(request, handler) {
        let exist = this.requested.get(request);
        if(!exist) {
            exist = [];
            this.requested.set(request, exist);
        }
        exist.push( handler );
    }

    over( handler ) {
        this.over.push( handler );
    }

    hook( request, data ) {
        if(request === "disconnect") {
            this.disconnected.map( handler => handler( request, data ) );
        } else {
            (this.requested.get(request) || []).map( handler => handler(request, data) );
        }
        this.over.map( handler => handler( request, data ) );
    }

}

export default function stream(constructor) {
    return new Stream(constructor);
};


const source = stream( ( emt, req ) => {

    emt(  );

    req.handle(  );

} );


source.connect( (msg) => {
    console.log(msg);
} );