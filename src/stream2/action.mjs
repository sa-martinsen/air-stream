export default class Action {

    constructor( src, { evt, stack } ) {
        this.stack = stack;
        this._evt = evt;
        this._observers = src._observers;
        this._processed = src._processed;
        this._processed.push(this);
        stack.push(this);
    }

    exec() {
        const cut = this._processed.indexOf(this);
        /*<@>*/if(cut < 0) throw `attempt to delete an event out of the processed queue`;/*</@>*/
        this._processed.splice(cut, 1);
        this._observers.map(obs => obs( ...this._evt ));
    }

}