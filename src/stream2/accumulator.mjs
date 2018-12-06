import { Pipe } from "./index.mjs"
import Action from "./action.mjs"
import perfomance from "./perfomance.mjs"

class AccAction extends Action {

    exec() {
        super.exec();
        this.src.__acc.push(this);
        if(this.src.__acc.length > 1) {
            if(this.src.__acc[0].stack.ttmp < perfomance() - 3000) {
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

    static combine([]) {

    }

    withLatest([]) {

    }

    map(project) {
        return super.map( project, Accumulator );
    }

    distinct(predicate) {
        return super.distinct( predicate, Accumulator );
    }

}