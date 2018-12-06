export default class Handler {

    constructor() {
        this.events = {};
    }

    on( request, cb ) {
        if(typeof request === "function") {
            cb = request;
            request = "*";
        }
        this.events[request] = this.events[request] || [];
        this.events[request].push(cb);
        return cb;
    }

    off( request, cb )  {
        if(typeof request === "function") {
            cb = request;
            request = "*";
        }
        const cut = this.events[request].indexOf(cb);
        /*<@>*/if(cut < 0) throw `attempt to delete an cb out of the container`;/*</@>*/
        this.events[request].splice(cut, 1);
        return cb;
    }

    request( { request = null, ...args } ) {
        ([ ...(this.events[request]||[]), ...(this.events["*"]||[]) ])
            .map( cb => cb( { request, ...args } ) );
    }

}