/**
 * reinit можно отправлять несолкьо раз, и он теперь не обновляет очередь,
 * для полного обновления нужно сделать полный реистанс модели
 *
 * filter не заботится о сохранности reinit для инициализации потока
 *
 * сохранность $SID должна гарантироваться извне
 */

export default class Observable {

    constructor(emitter, reglament = null) {
        this.obs = [];
        this.emitter = emitter;
        this.queue = [];
        this.reglament = reglament;
    }

    on(obs) {
        if(!this.obs.length) {
            this._caller = this.emitter(this) || null;
        }
        this.obs.push(obs);
        this.queue && this.queue.forEach( evt => obs( evt ) );
        return ({type = "disconnect", ...msg} = {}) => {
            if(type === "disconnect") {
                this.obs.splice(this.obs.indexOf(obs), 1);
                !this.obs.length && this._caller && this._caller();
            }
            else {
                this._caller && this._caller({type, ...msg});
            }
        }
    }

    emit({ __sid__ = Observable.__sid__ ++,...args }) {
        this.reglament && this.reglament(this, args);
        const evt = {...args, __sid__};
        this.queue.push(evt);
        this.obs.forEach( obs => obs( evt ) );
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
            const off = [];
            function check(evt) {
                const mess = observables.map(obs => {
                    const last = obs.queue.length && obs.queue.slice(-1)[0];
                    return last && last.__sid__ <= evt.__sid__ ? last : null
                });
                if(mess.every(msg => msg)) {
                    emt.emit({...project(evt, ...mess), __sid__: evt.__sid__});
                }
            }
            //если изменение из пассивов
            observables.forEach( obs => off.push(obs.on( evt => {
                //только если стволовой поток инициализирован
                //и текущий поток еще не был задействован
                if(this.queue.length && obs.queue.length === 1) {
                    check(this.queue.slice(-1)[0]);
                }
            })) );
            //если изменение от источника событий
            off.push(this.on( check ));
            return ({type = "disconnect", ...msg} = {}) => {
                if(type === "disconnect") {
                    off.forEach( caller => caller() );
                }
                else {
                    [...off].pop({type, ...msg});
                }
            };
        } );
    }

    withHandler( handler ) {
        return new Observable(
            emt => this.on( ({__sid__, ...evt}) => handler({
                emit: args => emt.emit({__sid__, ...args}),
                queue: emt.queue
            }, evt) ),
            this.reglament
        );
    }

    debounce( project ) {
        return this.withHandler( (emt, evt) => {
            project(evt) && (emt.queue.length = 0);
            return emt.emit(evt);
        } );
    }

    /**
     * @param project
     * @return Observable
     */
    partially(project) {
        return this.withHandler( (emt, evt) => emt.emit({...evt, ...project(evt)}) );
    }

    /**
     * @param project
     * @return Observable
     */
    map( project ) {
        return this.withHandler( (emt, evt) => emt.emit(project(evt)) );
    }

    /**
     *
     * @param project
     * @return Observable
     */
    filter( project ) {
        return this.withHandler( (emt, evt) => project(evt) && emt.emit(evt) );
    }

    log() {
        this.on( evt => console.log(evt));
    }

}

Observable.__sid__ = 0;
