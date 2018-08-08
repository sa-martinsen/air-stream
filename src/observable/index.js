/**
 * reinit можно отправлять несолкьо раз, и он теперь не обновляет очередь,
 * для полного обновления нужно сделать полный реистанс модели
 *
 * filter не заботится о сохранности reinit для инициализации потока
 *
 * сохранность $SID должна гарантироваться извне
 */

const { freeze } = Object;

export const keyF = freeze({ keyF: "keyF" });
export const keyA = freeze({ keyA: "keyA" });
export const empty = freeze({ empty: "empty" });

const sorter = ({__sid__: a, idx: ax}, {__sid__: b, idx: bx}) => a !== b ? a - b : ax - bx;

export default class Observable {

    constructor(emitter) {
        this.obs = [];
        this.emitter = emitter;
        this.queue = [];
        this.processed = [];
        this.init = false;
    }

    on(obs) {
        /*<@>*/ if(typeof obs !== "function") throw `first argument 'obs' must be a function`; /*</@>*/
        if(!this.obs.length) {
            const emt = (evt, src) => this.emit(evt, src);
            emt.emit = emt;
            emt.emt = emt;
            emt.kf = () => this.emit(keyF);
            this._disconnect = this.emitter(emt) || null;
        }
        this.queue.map( evt => obs(...evt) );
        this.obs.push(obs);
        return ( { dissolve = false, ... args } = { dissolve: true } ) => {
            if(dissolve) {
                const cut = this.obs.indexOf(obs);
                /*<@>*/if(cut < 0) throw `attempt to delete an observer out of the container`;/*</@>*/
                this.obs.splice(cut, 1);
                if(!this.obs.length) {
                    this.init = false;
                    this.queue = [];
                    this.clearProcessed();
                }
                if(this._disconnect) {
                    if(!this.obs.length) {
                        if(Array.isArray(this._disconnect) && this._disconnect[0] === "tail") {
                            [...this._disconnect[1], ...this._disconnect[2]].map( tail => tail( ) );
                        }
                        else {
                            Array.isArray(this._disconnect) ?
                                this._disconnect.map( tail => tail( { dissolve } ) ) : this._disconnect( { dissolve } );
                        }
                    }
                }
            }
            else {

                if(Array.isArray(this._disconnect) && this._disconnect[0] === "tail") {
                    this._disconnect[1].map( tail => tail( args ) );
                }

                else {
                    Array.isArray(this._disconnect) ?
                        this._disconnect.map( dis => dis( args ) ) : this._disconnect && this._disconnect( args );
                }
            }
        }
    }

    static merge( connectable, unconnectable, project ) {
        return new Observable( emt => {
            const _connectable = connectable.map( x => x.on(



            ) );
            const _unconnectable = [ unconnectable.map( x => x.on(



            ) )  ];
            return ({ dissolve, ...args }) => {
                if(dissolve) {
                    [..._connectable, ..._unconnectable].map( x=>x(  ) );
                }
                else {
                    _connectable.map( x=>x(args) );
                }
            }
        } );
    }

    at(obs) {
        return this.on( (...args) => !keys.includes(args[0]) && obs(...args) );
    }

    clearProcessed() {
        this.processed.map( process => this.cutFromQueue(process) );
        this.processed = [];
    }

    emit(data, { __sid__ = Observable.__sid__ ++, is = {}, rid = -1 } = {}) {

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

        const process = { act, __sid__ };
        this.processed.push(process);
        this.pushToQueue(process);
    }

    cutFromQueue({act}) {
        const {queue} = Observable;
        const cut = queue.findIndex(({act: x}) => x === act);
        /*<@>*/if(cut < 0) throw `attempt to delete an event out of the queue`;/*</@>*/
        queue.splice(cut, 1);
    }

    /**
     * @param act
     * @param sid
     */
    pushToQueue({act, __sid__}) {
        if(!Observable.queue) {
            Observable.queue = [];
            const queue = Observable.queue;
            setImmediate(() => {
                while (queue.length) {
                    Observable.dirtqueue && queue.sort(sorter);
                    Observable.dirtqueue = false;
                    queue.shift().act();
                }
                Observable.queue = null;
                Observable.idx = 0;
            });
        }
        Observable.queue.push({act, __sid__, idx: Observable.idx++});
        Observable.dirtqueue = true;
    }

    connected() {
        return new Observable( emt => {
            let _connected = false;
            return this.on(() => {
                if(!_connected) {
                    _connected = true;
                    emt.kf();
                }
            })
        } );
    }

    /**
     * 1 - новое событие от инициатора
     *
     * 2 - новое событие от ведомого
     * @param observables
     * @param project
     * @return Observable
     */
    withLatestFrom(observables = [], project = (...args) => args) {
        return new Observable( emt => {
            const tails = [];
            function check(evt, src) {
                const mess = observables.map(obs => {
                    const last = obs.queue.length && obs.queue.slice(-1)[0];
                    return last && last.__sid__ <= src.__sid__ ? last : null
                });
                if(mess.every(msg => msg)) {
                    emt({...project(evt, ...mess)}, src);
                }
            }
            //если изменение из пассивов
            observables.forEach( obs => tails.push(obs.on( evt => {
                //только если стволовой поток инициализирован
                //и текущий поток еще не был задействован
                if(this.queue.length && obs.queue.length === 1) {
                    check(...this.queue.slice(-1)[0]);
                }
            })) );
            //если изменение от источника событий
            tails.push(this.on( check ));
            return (...args) => tails.map( tail => tail(...args) );
        } );
    }

    first() {
        return new Observable( emt => this.on( (evt, src) => this.queue.length === 2 && emt(evt, src) ) );
    }

    switcher(observables) {
        return new Observable( emt => {
            let current = null;
            const sub = this.on( state => {
                current();
                current = observables[state].on( emt );
            } );
            return (...args) => {
                current && current(...args);
                sub && sub(...args);
            }
        } );
    }

    reduce(project) {
        return new Observable( emt => {
            let acc = empty;
            return this.on( (evt, src) => {
                if(evt === keyF) {
                    acc = empty;
                    emt(evt, src);
                }
                else if(acc === empty) {
                    acc = evt;
                    emt(acc, src);
                }
                else {
                    emt(acc = project( acc, evt, src ), src);
                }
            } );
        } );
    }

    controller( stream, handler = x => x ) {
        if(typeof stream === "function") {
            handler = stream;
            stream = null;
        }
        return new Observable( emt => {
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
                    const res = handler(args, emt, value);
                    res && over(res);
                }
            }
        });
    }

    service(  ) {
        return new Observable( emt => {
            const history = [];
            let controller;
            return controller = this.on( (evt, src) => {
                src.is = src.is || {};
                if( evt === keyA && src.is.err ) {
                    history.splice(history.findIndex( ([evt, {rid}]) => rid === src.rid ), 1);
                    controller( { request: history } );
                }
                else if(evt === keyF) {
                    history.length = 0;
                    history.push( [evt, src] );
                    emt( evt, src );
                }
                else {
                    history.push( [ evt, src ] );
                    emt( evt, src );
                }
            });
        } );
    }

    static merge(connectable, unconnectable, project = evt => evt) {
        return new Observable( emt =>

            [ "tail",

                connectable.map( obs => obs.on( (evt, src) => {

                    if(evt === keyF && connectable.every( ({queue}) => queue.length === 1)) {
                        return emt(evt, src);
                    }

                    if(evt !== keyF && connectable.every( ({queue}) => queue.length >= 1)) {
                        return emt(project(evt, src), src);
                    }

                } ) ),

                unconnectable.map( obs => obs.on( (evt, src) => {

                    if(evt !== keyF && connectable.every( ({queue}) => queue.length >= 1)) {
                        return emt(project(evt, src), src);
                    }

                } ) ),

            ]
         );
    }

    static project(...args) { return args; }

    static combine(observables = [], project = Observable.project) {
        if(!observables.length) throw `observables must be an array of length at least 1`;
        return new Observable( emt => {
            observables = observables.map( obs => Observable.from(obs) );
            const tails = observables.map( obs => obs.on( (evt, src) => {
                if(evt === keyF && observables.every( ({queue}) => queue.length === 1)) {
                    return emt(evt, src);
                }
                let events = observables
                    .map( ({ queue }) => queue/*.filter( ([_, {__sid__}]) => __sid__ <= src.__sid__ )*/ );
                if(events.every( evt => evt.length > 1 )) {
                    const _events = events.map( evt => evt.slice(-1)[0][0] );
                    _events.splice( observables.indexOf(obs), 1, evt );

                    if(_events.some(evt => evt === keyF)) {
                        debugger;
                    }

                    emt( project(..._events), src );
                }
            } ) );
            return (...args) => tails.forEach(tail => tail(...args));
        });
    }

    static from(obs) {
        return new Observable( emt => obs.on(emt));
    }

    withHandler( handler ) {
        return new Observable( emt =>
            this.on( (evt, src) => {
                if(keys.includes(evt)) return emt( evt, src );
                const _emt = evt => emt(evt, src);
                _emt.emit = _emt;
                return handler(_emt, evt)
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
     * @return Observable
     */
    partially(project) {
        return this.withHandler( (emt, evt) => emt({...evt, ...project(evt)}) );
    }

    /**
     * @param project
     * @return Observable
     */
    map( project ) {
        return this.withHandler( (emt, evt) => emt(project(evt)) );
    }

    /**
     *
     * @param project
     * @return Observable
     */
    filter( project ) {
        return this.withHandler( (emt, evt) => project(evt) && emt(evt) );
    }

    log( adapty = (...args) => args ) {
        this.on( (evt, src) => console.log(...adapty(evt, src)));
        return this;
    }

}

Observable.__sid__ = 0;
Observable.idx = 0;
Observable.keyF = keyF;
Observable.keyA = keyA;
const keys = Observable.keys = [ keyF, keyA ];
export const merge = Observable.merge;
export const combine = Observable.combine;