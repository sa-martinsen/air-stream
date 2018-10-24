import Stack from "../observable/stack.mjs"
import Queue from "../observable/queue.mjs";

const stacks = [];
const QUEUE = new Queue();

const { freeze } = Object;
export const keyF = freeze({ keyF: "keyF" });
export const keyA = freeze({ keyA: "keyA" });

class Stream {

    constructor( reactor, reducer = (acc, evt) => evt ) {
        this.reactor = reactor;
        this.reducer = reducer;
        this.emitter = null;
        this.handler = null;
        this.initialize = false;
        this.obs = [];
        this.processed = [];
        this.queue = [];
    }

    on(obs) {
        /*<@>*/ if(typeof obs !== "function") throw `first argument 'obs' must be a function`; /*</@>*/
        if(!this.obs.length) {
            this.reactor(this.emitter = new Emitter(), this.handler = new Handler());
        }
        this.queue.map( evt => obs(...evt) );
        this.obs.push(obs);
        return ( { request = "disconnect", ...args } = {} ) => {
            if(request === "disconnect") {
                const cut = this.obs.indexOf(obs);
                /*<@>*/if(cut < 0) throw `attempt to delete an observer out of the container`;/*</@>*/
                this.obs.splice(cut, 1);
                if(!this.obs.length) {
                    this.handler.request( { request } );
                    this.initialize = false;
                    this.emitter = null;
                    this.handler = null;
                    this.queue.length = 0;
                    this.clearProcessed();
                }
            }
            else {
                this.handler.request( { request, ...args } );
            }
        }
    }

    at(obs) {
        return this.on( (...args) => !keys.includes(args[0]) && obs(...args) );
    }

    clearProcessed() {
        this.processed.map( ({ stack, act }) => {
            stack.cuts(act)
        } );
        this.processed.length = 0;
    }

    emit(data, { __sid__ = stacks.length, is = {}, rid = -1 } = {}) {

        const stack = stacks[__sid__] || (stacks[__sid__] = new Stack({__sid__, queue: QUEUE }));

        if(!this.init && data !== keyF) {
            this.emit(keyF, { __sid__ });
        }

        this.init = true;

        /*<@>*/if(data === undefined) throw `attempt to emit 'undefined' data`;/*</@>*/

        if(data === keyF) {
            this.clearProcessed();
        }

        const evt = [data, {__sid__, is, rid }];

        const act = () => {
            if(data === keyF) this.queue.length = 0;
            this.queue.push(evt);
            const cut = this.processed.findIndex(({act: x}) => x === act);
            /*<@>*/if(cut < 0) throw `attempt to delete an event out of the processed queue`;/*</@>*/
            this.processed.splice(cut, 1);
            this.obs.map(obs => obs( ...evt ));
        };

        this.processed.push({ act, stack });
        stack.push(act);

    }

    withLatest(streams = [], project = (...args) => args) {
        return new Stream( emt => {
            const tails = [];
            function check(evt, src) {

                if(evt === keyF) {
                    return emt(evt, src);
                }

                const mess = streams.map(obs => {
                    const last = obs.queue.slice().reverse().find( ([evt]) => !keys.includes(evt) );
                    return last && last[1].__sid__ <= src.__sid__ ? last[0] : null
                });
                if(mess.every(msg => msg)) {
                    emt([...project(evt, ...mess)], src);
                }
            }

            streams.map( obs => tails.push(obs.on( evt => {

                if(this.queue.length && obs.queue.length === 1) {
                    check(...this.queue.slice(-1)[0]);
                }
            })) );

            tails.push(this.on( check ));
            return (...args) => tails.map( tail => tail(...args) );
        } );
    }

    ready() {
        let ready = false;
        return new Stream( emt =>
            this.at( (evt, src) => {
                if(!ready) {
                    ready = true;
                    emt( evt, src );
                }
            })
        );
    }

    controller( stream, handler = x => x ) {
        if(typeof stream === "function") {
            handler = stream;
            stream = null;
        }
        return new Stream( emt => {
            let value;
            const subs = this.on((...args) => {
                value = args[0];
                emt(...args);
            });
            const over = stream ? stream.on(() => {}) : subs;
            return ({dissolve, ...args}) => {
                if(dissolve) {
                    value = undefined;
                    subs({dissolve: true});
                    subs !== over && over({dissolve: true});
                }
                else {
                    const res = handler({dissolve: false, ...args}, emt, value);
                    res && over(res);
                    subs !== over && subs({dissolve: false, ...args}, emt, value);
                }
            }
        });
    }

    static combine(observables = [], project = (...args) => args) {
        if(!observables.length) throw `observables must be an array of length at least 1`;
        return new Stream( emt => {
            observables = observables.map( obs => Stream.from(obs) );
            const tails = observables.map( obs => obs.on( (evt, src) => {
                if(evt === keyF && observables.every( ({queue}) => queue.length === 1)) {
                    return emt(evt, src);
                }
                let events = observables
                    .map( ({ queue }) => queue/*.filter( ([_, {__sid__}]) => __sid__ <= src.__sid__ )*/ );
                if(events.every( evt => evt.length > 1 )) {
                    const _events = events.map( evt => evt.slice(-1)[0][0] );
                    _events.splice( observables.indexOf(obs), 1, evt );

                    if(_events.some(({keyF}) => keyF)) {
                        throw `may by a several instances of air-stream is loaded?`;
                    }

                    emt( project(..._events), src );
                }
            } ) );
            return (...args) => tails.forEach(tail => tail(...args));
        });
    }

    withHandler( handler ) {
        return new Stream( emt =>
            this.on( (evt, src) => {
                if(keys.includes(evt)) return emt( evt, src );
                const _emt = (evt, _src) => emt(evt, _src || src);
                _emt.emit = _emt;
                return handler(_emt, evt)
            })
        );
    }

    distinct( equal = (a, b) => a === b ) {
        let prev = null;
        return new Stream( emt =>
            this.on( (evt, src) => {
                if(evt === keyF) {
                    prev = keyF;
                }
                if(!keys.includes(evt)) {
                    if(prev === keyF) {
                        emt(prev = evt, src);
                    }
                    else {
                        if(!equal(prev, evt)) {
                            emt(prev = evt, src);
                        }
                    }
                }
                else {
                    emt(evt, src);
                }
            })
        );
    }

    cut( project ) {
        return this.withHandler( (emt, evt) => {
            const data = project(evt);
            data && emt(data)
        } );
    }

    /**
     * @param project
     * @return Stream
     */
    partially(project) {
        return this.withHandler( (emt, evt) => emt({...evt, ...project(evt)}) );
    }

    /**
     * @param project
     * @return Stream
     */
    map( project ) {
        return this.withHandler( (emt, evt) => emt(project(evt)) );
    }

    /**
     *
     * @param project
     * @return Stream
     */
    filter( project ) {
        return this.withHandler( (emt, evt) => project(evt) && emt(evt) );
    }

    log( adapty = (...args) => args ) {
        this.on( (evt, src) => console.log(...adapty(evt, src)));
        return this;
    }

}

export default (...args) => new Stream(args);