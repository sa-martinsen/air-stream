import { Pipe } from "./"
import Action from "./action.mjs"
import perfomance from "./perfomance.mjs"

class AccAction extends Action {

    exec() {
        super.exec();
        this.src.__acc.push(this);
        if(this.src.__acc.length > 1) {
            if(this.src.__acc[0].stream.ttmp < perfomance() - 3000) {
                this.src.__acc.shift();
            }
        }
    }

}

export default class Accumulator extends Pipe {

    constructor() {
        super();
        this.__acc = [];
    }

    /**
     * @param {Observer} observer
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

}