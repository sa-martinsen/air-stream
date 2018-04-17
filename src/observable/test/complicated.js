import {expect} from "chai";
import Observable from "../index";


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

});