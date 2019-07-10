import Observable from "../index.mjs"
import {series} from "./../../utils.mjs"

describe('map', () => {

    test('simple', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual(Observable.keyF),
            evt => expect(evt).toEqual(31),
            evt => expect(evt).toEqual(41),
        ]);

        const source = new Observable( emt => {
            emt.kf();
            emt(1);
            emt(2);
            emt.kf();
            emt(3);
            emt(4);
        });

        source.map(x => x*10+1).on( done );

    });

});