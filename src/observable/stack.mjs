export default class Stack {

  constructor ({ __sid__, queue }) {
    this.__sid__ = __sid__;
    this.begin = null;
    this.end = null;
    this.queue = queue;
    this.quined = false;
    queue.push(this);
  }

  push (act) {
    if (!this.quined) {
      let index = bfindindex(this.queue.itm, this.__sid__);
      if (index === -1) index = this.queue.itm.length;
      this.queue.splice(index, 0, this);
      this.quined = true;
    }
    act.next = null;
    act.prev = null;
    if(!this.begin) {
        this.begin = act;
        this.end = act;
    }
    else {
        this.end.next = act;
        act.prev = this.end;
        this.end = act;
    }
  }

  exec () {
      let begin = this.begin;
      if(begin) {
        this.begin = begin.next;
        if(this.begin) {
            this.begin.prev = null;
        }
        else {
            this.end = null;
        }
      }
      else {
          this.queue.remove(this);
          this.quined = false;
      }
    if(begin) {
        begin();
    }
  }

  cuts (act) {
      if(act === this.begin) {
          this.begin = act.next;
      }
      if(act === this.end) {
          this.end = act.prev;
      }
      if(act.prev) {
          act.prev.next = act.next;
      }
      if(act.next) {
          act.next.prev = act.prev;
      }
  }

}

const bfindindex = (arr, sid) => arr.findIndex(x => sid < x.__sid__);