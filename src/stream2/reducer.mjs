import { keyF, keys } from "./"
import Accumulator from "./accumulator.mjs"
import { stacks } from "./stack.mjs"
import { MERT } from "./defs.mjs"

export default class Reducer extends Accumulator {

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

            let keyState = null;
            let controllerQuene = [];
            let keyFrame = null;
            let acc = null;
            let tokenIndex = 0;

            req.on( eventstream.on( ( evt, src ) => {

                if(keys.includes(evt)) return;

                if(!keyFrame || stacks[ keyFrame[1].sid ].ttmp < stacks[ src.sid ].ttmp) {
                    controllerQuene.push(evt);
                }

                if(keyFrame) {

                    if(controllerQuene.length - 1 > tokenIndex) {

                        acc = [ project( acc, evt, src ), src ];

                        emt( acc, evt );

                    }

                }

            } ));

            const initStreamHook = req.on(initstream.on( ( evt, src ) => {

                if(evt === keyF) {
                    keyState = null;
                    tokenIndex = 0;
                    keyFrame = null;
                }

                else if(evt === keyA) {

                    if(src.is.aborted) {

                    }

                    else if(src.is.confirmed) {

                    }

                }

                else {

                    if(!keyFrame) {
                        acc = keyFrame = [evt, src];

                        controllerQuene = controllerQuene.filter( ([, sid]) =>
                            stacks[sid].ttmp < stacks[src.sid]
                         );



                    }
                    else {
                        throw "key frame has already been received";
                    }

                }

                emt( evt, src );

            } ));

        } );

    }

    static combine([]) {

    }

    withLatest([]) {

    }

    filter() {

    }

}