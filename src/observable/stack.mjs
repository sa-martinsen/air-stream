export default class Stack {

    constructor( {__sid__, queue } ) {
        this.itm = [];
        this.__sid__ = __sid__;
        this.queue = queue;
        this.quined = true;
        queue.push(this);
    }

    push(act) {
        if(!this.quined) {
            let index = bfindindex( this.queue.itm, this.__sid__ );
            if(index === -1) index = this.queue.itm.length;
            this.queue.splice(index, 0, this);
            this.quined = true;
        }
        this.itm.push(act);
    }

    splice(...args) {
        this.itm.splice(...args);
        //if(!this.itm.length) this.exec();
    }

    exec() {

        if(this.itm.length) {
            this.itm.shift()();
        }
        else {

            const cut = this.queue.itm.indexOf( this );
            /*<@>*/if(cut < 0) throw `attempt to delete an event out of the processed queue`;/*</@>*/
            this.queue.splice( cut, 1 );
            this.quined = false;

        }
/*
        while (this.itm.length) {
            this.itm.shift()();
        }*/

    }

    cuts(act) {
        const cut = this.itm.findIndex(x => x === act);
        /*<@>*/if(cut < 0) throw `attempt to delete an event out of the queue`;/*</@>*/
        this.splice(cut, 1);
    }

}

const bfindindex = (arr, sid) => {
    return arr.findIndex( ({__sid__}) => sid < __sid__ );
};