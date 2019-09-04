import { stream2 as stream } from "../index.mjs";
import {series} from "../../utils.mjs"

describe('constructor', function () {

    test('simple construct', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( 1 ),
            evt => expect(evt).toEqual( 2 ),
        ]);

        const source = stream([], function (e) {
	        e( 1 );
	        e( 2 );
        });

        source.on(done);

    });
/*
    it('empty queue', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( Observable.keyF ),
        ]);

        const source = new Observable(function (emt) {
            emt.kf();
            emt(1);
            emt(2);
            emt.kf();
            emt(3);
            emt(4);
            emt.kf();
        });

        source.on(done);

    });
*/
    test('second subscriber after events', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( 1 ),
            evt => expect(evt).toEqual( 2 ),
            evt => expect(evt).toEqual( 1 ),
            evt => expect(evt).toEqual( 2 ),
            evt => expect(evt).toEqual( 3 ),
            evt => expect(evt).toEqual( 3 ),
        ]);

        const source = stream( [], e => {
            e(1);
            e(2);
            e(3);
        });

        source.on( (data) => {
            done(data);
            if(data === 2) {
                source.on( done );
            }
        } );

    });

    test('unsubscribe', (done) => {

        done = series(done, [
	        evt => expect(evt).toEqual( 1 ),
        ]);

        const source = stream( [], (e, controller) => {
            e(1);
            const sid = setTimeout( () => e(2) );
            controller.ondisconnect( () => {
                clearTimeout( sid )
            } );
        });

        source.on( done )();

    });

    test('unsubscribe with broken emitter', () => {

        const source = stream( [], e => {
            e(1);
            setTimeout( () => {
                expect(() => e(2)).toThrow("More unused stream continues to emit data");
            } );
        });

        source.on( () => {} )();

    });

/*
    it('unsubscribe over time', (done) => {

        done = series(done, [
            evt => expect(evt).toEqual( Observable.keyF ),
            evt => expect(evt).toEqual( 6 ),
            evt => expect(evt).toEqual( 7 ),
        ]);

        const source = new Observable( emt => {
            emt.kf();
            emt(1);
            emt(2);
            emt(3);
            emt(4);
            emt(5);
            emt.kf();
            emt(6);
            emt(7);
            setTimeout( () => emt(8) );
        });

        const uns = source.on( done );
        setTimeout(() => uns());

    });*/

});