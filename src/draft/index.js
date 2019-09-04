const SIGNALS = {
  CONNECT: 100,
};

let LABELS_ID = 0;

export default class Net {

  constructor (streams, {
    autoConnectable = true,
    label = ++LABELS_ID,
  } = {}) {
    this.label = label;
    this.streams = streams;
    this.__req = [];
    this.autoConnectable = autoConnectable;
    this.state = {
      hasConnected: autoConnectable,
    };
    this.subscribers = [];
  }

  onConnect () {
    this.__req.push(...this.streams.map(stream => stream.connect(this)));
  }

  onDisconnect () {
    if (!this.autoConnectable) {
      this.state.connected = false;
    }
  }

  connect (subscriber) {
    this.subscribers.push(subscriber);
    if (this.state.hasConnected) {
      subscriber.emt(SIGNALS.CONNECT, this);
    }
    this.onUnitConnected(subscriber);
    return () => this.disconnect(subscriber);
  }

  disconnect (subscriber) {
    if (!this.autoConnectable) {
      this.state.connected = false;
    }
    const subscriberPlace = this.subscribers.indexOf(subscriber);
    if (subscriberPlace === -1) {
      throw '';
    }
    this.subscribers.splice(subscriberPlace, 1);
    this.onUnitDisconnected(subscriber);
    if (!this.subscribers.length) {
      this.onDisconnect();
    }
  }

  onRequest (data) {
    if (this.state.hasConnected) {
      this.__req.map(req => req.onRequest(data));
    }
  }

  emt (action, src) {
    if (action === SIGNALS.CONNECT) {
      if (!this.state.hasConnected) {
        this.state.hasConnected =
          this.streams.every(({ state: { hasConnected } }) => hasConnected);
        if (this.state.hasConnected) {
          this.subscribers.map(subscriber => subscriber.emt(SIGNALS.CONNECT, this));
        }
      }
    } else {
      this.onAction(action, src);
    }
  }

  onAction () {

  }

  onUnitConnected () {

  }

  onUnitDisconnected (subscriber) { }

  forceDisconnectTo (subscriber) {

  }

}