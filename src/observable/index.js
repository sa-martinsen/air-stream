/**
 * reinit можно отправлять несолкьо раз, и он теперь не обновляет очередь,
 * для полного обновления нужно сделать полный реистанс модели
 *
 * filter не заботится о сохранности reinit для инициализации потока
 *
 * сохранность $SID должна гарантироваться извне
 */

export default class Observable {

    constructor(emitter) {
        this.obs = [];
        this.emitter = emitter;
        this.queue = [];
    }

    on(obs) {
        if(!this.obs.length) {
            const emt = (evt, src) => this.emit(evt, src);
            emt.emit = emt;
            emt.complete = (evt, src) => this.complete(evt, src);
            this._disconnect = this.emitter(emt) || null;
        }
        this.obs.push(obs);
        this.queue && this.queue.forEach( evt => obs( ...evt ) );
        return () => {
            this.obs.splice(this.obs.indexOf(obs), 1);
            !this.obs.length && this._disconnect && this._disconnect();
        }
    }

    emit(data, { __sid__ = Observable.__sid__ ++, type = "reinit"} = {}) {
        const evt = [data, {__sid__, type}];
        this.queue.push(evt);
        this.obs.forEach( obs => obs( ...evt ) );
    }

    complete(data, { __sid__ = Observable.__sid__ ++, type = "complete"} = {}) {
        const evt = [data, {__sid__, type}];
        this.queue.push(evt);
        this.obs.forEach( obs => obs( ...evt ) );
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
            observables.forEach( obs => off.push(obs.on( evt => {
                //только если стволовой поток инициализирован
                //и текущий поток еще не был задействован
                if(this.queue.length && obs.queue.length === 1) {
                    check(...this.queue.slice(-1)[0]);
                }
            })) );
            //если изменение от источника событий
            off.push(this.on( check ));
            return () => off.forEach( unobserve => unobserve() );
        } );
    }

    withHandler( handler ) {
        return new Observable( emt =>
            this.on( (evt, src) => {
                const _emt = evt => emt(evt, src);
                _emt.emit = _emt;
                return handler(_emt, evt)
            })
        );
    }

    ifExist( project ) {
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

    log() {
        this.on( evt => console.log(evt));
    }

}

Observable.__sid__ = 0;
