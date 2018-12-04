import { Pipe, keyF, keys } from "./"

export default class Reducer extends Pipe {

    /**
     * @param { Hut|Cold } initstream
     * @param { Hut|Cold } eventstream
     * @param { Function } project
     * @param { Boolean } autoconfirmed
     */
    constructor(
        eventstream,
        initstream,
        project = (acc, next) => next,
        { autoconfirmed = false } = {}
    ) {

        super( ( { emt, kf, req } ) => {

            let initializer = null;
            
            const sync = (evt, src) => {

                if(evt === keyF) {
                    this.__quene = null;
                }

                else {

                    this.__quene = [ [ evt, src ] ];

                    emt( evt, src );

                }

            };

            req.on("disconnect", initstream.on( ( evt, src ) => {

                if(evt === keyF) {

                    initializer = [ evt, src ];
                    emt( evt, src );

                }

                else if(evt === keyA) {

                    if(src.is.aborted) {

                    }

                    else if(src.is.confirmed) {

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

            const eventstreamhook = req.on( eventstream.on( ( evt ) => {



            } ));

        }, { adjactive: initstream && !eventstream.adjactive } );

        this.__quene = null;

        this._autoconfirmed = autoconfirmed;

    }

    static combine([]) {

    }

    withLatest([]) {

    }

    filter() {

    }

}