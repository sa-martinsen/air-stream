export default class Controller extends Pipe {

    constructor(from, stream, handler) {
        super( ( ) => {
            let value;
            const subs = from.on((...args) => {
                value = args[0];
            });
            const over = stream ? stream.on(() => {}) : subs;
            return ({request = null, ...args} = { request: "disconnect" }) => {
                if(request === "disconnect") {
                    value = undefined;
                    subs({request});
                    subs !== over && over({request});
                }
                else {
                    const res = handler({request, ...args}, (...args) => this._emitter(...args), value);
                    res && over(res);
                    subs !== over && subs({request, ...args}, (...args) => this._emitter(...args), value);
                }
            }
        });
        this.from = from;
        this._subobservers = [];
    }

    _emitter(...args) {
        this._subobservers.map( obs => obs( ...args ) )
    }

    on( observer ) {
        let hn = null;
        this._subobservers.push(observer);
        if(!this._observers.length) {
            hn = super.on( () => {} );
        }
        const hds = this.from.on( observer );
        return ( { request = null, ...args } = { request: "disconnect" } ) => {
            if(request === "disconnect") {
                hds( { request, ...args } );
                this._subobservers.splice( this._subobservers.indexOf(observer), 1 );
                if(!this._observers.length) {
                    hn && hn( { request } );
                }
            }
            else {
                hn && hn( { request, ...args } );
            }
        }
    }

}