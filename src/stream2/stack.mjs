import performance from "./perfomance.mjs"

export default class Stack {

    constructor( { sid, queue } ) {
        this.ttmp = performance();
        this.itm = [];
        this.sid = sid;
        this._queue = queue;
        this._quined = true;
        queue.push(this);
    }

    push(act) {
        if(!this._quined) {
            let index = bfindindex( this._queue.itm, this.sid );
            if(index === -1) index = this._queue.itm.length;
            this._queue.splice(index, 0, this);
            this._quined = true;
        }
        this.itm.push(act);
    }

    splice(...args) {
        this.itm.splice(...args);
    }

    exec() {
        if(this.itm.length) {
            this.itm.shift().exec();
        }
        else {
            const cut = this._queue.itm.indexOf( this );
            /*<@>*/if(cut < 0) throw `attempt to delete an event out of the processed queue`;/*</@>*/
            this._queue.splice( cut, 1 );
            this._quined = false;
        }
    }

    cuts(act) {
        const cut = this.itm.findIndex(x => x === act);
        /*<@>*/if(cut < 0) throw `attempt to delete an event out of the queue`;/*</@>*/
        this.splice(cut, 1);
    }

}

const bfindindex = (arr, sid) => {
    return arr.findIndex( ({sid: x}) => sid < x );
};

export const stacks = [];