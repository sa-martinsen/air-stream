import {expect} from "chai"
import {series} from "../../utils.mjs"
import {describe, it} from "mocha"
import { socket, keyF } from "../../index.mjs"

global.WebSocket = class {

    constructor(url) {
        console.log( "create" );
        this._readystate = 0;
        setTimeout(() => {
            this._readystate = 1;
            if(this.listener) {
                this.listener.handleEvent( { type: "open" } );
            }

            setTimeout(() => {
                this.listener.handleEvent( { type: "message", data: `init` } );
            }, 0);

        }, 0);
    }

    send(data) {
        console.log("sended", data);
    }

    get readyState() {
        return this._readystate;
    }

    close() {
        console.log("close");
    }

    addEventListener(type, listener) {
        this.listener = listener;
    }

    removeEventListener() {
        this.listener = null;
    }

};

describe('constructor', function () {

    it('simple', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal(keyF),
            evt => expect(evt).to.deep.equal("init"),
        ]);

        const source = socket( { url: "wss://" } );

        source.log().on(done);

    });

});