import {describe, it} from "mocha"
import { merge, stream, keyF } from "../../index.mjs"
import {expect} from "chai"
import {series} from "../../utils.mjs"


class Socket {

    constructor() {
        this.obs = [];
    }

    on( obs ) {
        this.obs.push( obs );
        setTimeout( () => obs( {
            action: "initialize",
            state: {
                mass: [1, 5, 6, 7, 20],
                rnm: 2
            }
        } ) );
    }

    off( obs ) {
        this.obs.splice( this.obs.indexOf(obs), 1 );
    }

    send(data) {
        setTimeout( () => this.obs.map( obs => obs( data ) ) );
    }

}
/*
describe('1.', function () {

    it('a)', (done) => {

        const srv = new Observable(function ({ push }) {

            const socket = new Socket();
            socket.on( function ( {action, __sid__ = -1, ...data} ) {

                if(action === "ok") {
                    push(  );
                }

            } );

            return ( {action, data} ) => {
                socket.send( { action, ...args } );
            }
        });

    });

});*/

describe('complicated', function () {

    it('stream reopening', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.equal( "a1" ),
            evt => expect(evt).to.equal( "b2" ),
            evt => expect(evt).to.equal( "c3" ),
            evt => expect(evt).to.equal( "d4" ),
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.equal( "a1" ),
            evt => expect(evt).to.equal( "b2" ),
            evt => expect(evt).to.equal( "c3" ),
            evt => expect(evt).to.equal( "d4" ),
        ]);

        const source = stream( emt => {
            emt("a1");
            emt("b2");
            emt("c3");
            emt("d4");
        } );

        const hook = source.on( done );
        setTimeout(() => {
            hook();
            source.on( done );
        }, 10);

    });

});