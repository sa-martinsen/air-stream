import { keyF, keys } from "./"

export default class Reducer extends Pipe {

    /**
     *
     * @param { Hut|Cold } initstream
     * @param { Hut } eventstream
     * @param { Boolean } autoconfirmed
     */
    constructor( initstream, eventstream, { autoconfirmed } = { autoconfirmed: false } ) {

        super( ( emt, req ) => {

            const streams = [];
            let initializer = null;
            
            const sync = (evt, src) => {

                if(evt === keyF && streams.every(z => z)) {
                    initializer = null;
                    emt( evt, src );
                }

                else {

                    emt.kf( src );

                    //resubscribe to event stream
                    //filter past events
                    //(reconnect)

                    //require 3sec delay
                    emt( evt, src );

                    initializer = [ evt, src ];

                    reconnect();

                }

            };

            req.on("disconnect", initstream.on( ( evt, src ) => {

                if(evt === keyF) {

                    //reconnect();

                    if( initialized ) {

                    }

                }

                //aborted to controller stream
                /*else if( evt === keyA && src.is.aborted ) {

                    reconnect();

                    //resubscribe to event stream
                    //filter past events
                    //(reconnect)

                    emt();

                }*/

                //sync(evt, src);

            } ));

            const reconnect = () => {
                emt.kf(  );
                eventstreamhook.refresh();
            };

            //immediately subscribe to multi thread

            const eventstreamhook = req.on( eventstream.on( ( evt ) => {



            } ));

        } );

    }

    map() {



    }

}