import {keyA, keyF, keys, rid} from "./index.mjs"
import Accumulator from "./accumulator.mjs"
import { MERT } from "./defs.mjs"
import perfomance from "./perfomance.mjs"

export default class Reducer extends Accumulator {

    /**
     * @param { Pipe } initstream
     * @param { Pipe } eventstream
     * @param { Function } project
     * @param { Boolean } free
     */
    constructor(
        eventstream,
        initstream,
        project = (acc, next) => next,
        { free = false } = {}
    ) {

        super( ( { emt, kf, req } ) => {

            let controllerQueue = [];
            let keyFrame = null;
            let acc = null;
            let tokenIndex = 0;

            req.on( "disconnect", eventstream.on( ( evt, src ) => {

                if(keys.includes(evt)) return;

                if(!keyFrame || keyFrame[1].sid <= src.sid ) {
                    controllerQueue.push({ is: 0, evt, src, key: null });
                }

                if(keyFrame) {

                    if(controllerQueue.length > tokenIndex) {

                        acc = [ project( acc[0], evt, src ), src ];

                        emt( ...acc );

                        if(free) {
                            keyFrame = acc;
                        }
                        else {

                            initStreamHook( {
                                conformation: evt,
                                rid: controllerQueue[tokenIndex].src.rid = rid(),
                                data: acc[0]
                            } );
                            tokenIndex++;

                        }

                    }

                }

            } ));

            const initStreamHook = req.on( initstream.on( ( evt, src ) => {

                if(evt === keyF) {
                    tokenIndex = 0;
                    keyFrame = null;
                    emt( evt, src );
                }

                else if(evt === keyA) {

                    const exist = controllerQueue.findIndex(
                        ({ src: { rid } }) => rid === src.rid
                    );

                    if(exist > -1) {

                        if(src.is.aborted) {

                            tokenIndex -- ;

                            controllerQueue.splice(exist, 1);

                            emt( keyF, keyFrame[1] );

                            emt( ...keyFrame );

                            acc = controllerQueue.reduce(([evt], next) => {
                                const res = project(evt, next.evt, next.src);
                                next.key = res;
                                emt( res, next.src );
                                return [ res, next.src ];
                            }, keyFrame);

                        }

                        else if(src.is.confirmed) {

                            controllerQueue[exist].is = 1;
                            const cttmp = perfomance() - MERT;

                            const endPoint = controllerQueue.findIndex(
                                ({ src: { is, ttmp } }) => is && ttmp < cttmp
                            );

                            //+1 point to the left than time
                            if(endPoint > 0) {
                                tokenIndex -= endPoint;
                                controllerQueue.splice(0, endPoint);
                                keyFrame = [ controllerQueue[0].key, controllerQueue[0].src ]
                            }

                        }

                    }

                    else {

                        emt( evt, src );

                    }

                }

                else {

                    if(!keyFrame) {
                        acc = keyFrame = [evt, src];

                        emt( evt, src );

                        controllerQueue = controllerQueue.filter( ({src: { sid }}) => sid >= src.sid );

                        if(controllerQueue.length) {

                            acc = controllerQueue.reduce(([evt], next) => {
                                const res = project(evt, next.evt, next.src);
                                if(!free) {
                                    next.key = res;
                                    initStreamHook( {
                                        conformation: next.evt,
                                        rid: next.src.rid = rid(),
                                        data:
                                        res
                                    } );
                                }

                                emt( res, next.src );

                                return [ res, next.src ];
                            }, acc);

                            if(free) {
                                keyFrame = acc;
                            }

                            tokenIndex = controllerQueue.length;

                        }

                    }
                    else { throw "key frame has already been received"; }

                }

            } ));

        } );

    }

}