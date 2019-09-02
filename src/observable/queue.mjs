import setImmediate from '../set_immediate.mjs';
import globals from './globals.mjs';

export default class Queue {

  constructor () {
    this.itm = [];
    this.inited = false;
  }

  push (itm) {
    this.itm.push(itm);
    this.queue();
  }

  queue () {
    if (!this.inited) {
      this.inited = true;
      setImmediate(() => {
        while (this.itm.length) {
          this.itm[0].exec();
        }
        this.inited = false;
        globals.SID++;
      });
    }
  }

  remove (itm) {
    const cut = this.itm.indexOf(itm);
    /*<@>*/
    if (cut < 0) throw `attempt to delete an event out of the processed queue`;/*</@>*/
    this.itm.splice(cut, 1);
  }

  splice (...args) {
    this.itm.splice(...args);
    this.queue();
  }

}