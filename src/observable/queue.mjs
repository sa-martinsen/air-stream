import setImmediate from "../set_immediate.mjs";

export default class Queue {

    constructor() {
        this.itm = [];
        this.inited = false;
    }

    push(itm) {
        this.splice( this.itm.length, 0, itm );
    }

    splice(...args) {
        this.itm.splice(...args);
        if(!this.inited) {
            this.inited = true;
            setImmediate(() => {
                while (this.itm.length) {
                    this.itm[0].exec();
                }
                this.inited = false;
            });
        }
    }

}