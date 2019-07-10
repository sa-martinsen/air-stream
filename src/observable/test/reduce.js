import Observable from "../index.mjs";
import {series} from "./../../utils.mjs"

describe('reduce', () => {

    test('simple1', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual(Observable.keyF),
            evt => expect(evt).toEqual({ n: [  ], id: 158, stage: 1, time: 0 }),
            evt => expect(evt).toEqual({ n: [ 10, 15, ], id: 158, stage: 1, time: 0 }),
            evt => expect(evt).toEqual({ n: [ 10, 15, 16, 17, 18, ], id: 158, stage: 1, time: 0 }),
            evt => expect(evt).toEqual({ n: [ 10, 15, 16, 17, 18, ], id: 158, stage: 0, time: 15 }),
            evt => expect(evt).toEqual({ n: [ ], id: 159, stage: 1, time: 0 }),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt({ n: [], id: 158, stage: 1, time: 0 });
            emt({ action: "continue", data: [ 10, 15 ] });
            emt({ action: "continue", data: [ 16, 17, 18 ] });
            emt({ action: "end", time: 15 });
            emt({ action: "next" });
        } );

        const reducer = source.reduce( function (acc, {action, data, time}) {

            if(action === "continue") {
                return {
                    ...acc,
                    n: [ ...acc.n, ...data ]
                }
            }

            else if(action === "end") {
                return {
                    ...acc,
                    stage: 0,
                    time
                };
            }

            else if(action === "next") {
                return {
                    n: [],
                    stage: 1,
                    time: 0,
                    id: acc.id + 1
                }
            }

        } );

        reducer.on( done );

    });

});