import { Reducer, stream2 as stream } from '../index';
import { streamEqualStrict } from '../../utils';

describe('reducer', function () {
/*
    test('clear reducer construct with initialized stream', (done) => {
        const state = stream( [], function (e) {
            setTimeout(() => e({ready: true}), 10);
        } );
        const reducer = new Reducer(null, null, state);
        streamEqualStrict(done, reducer, [
            {data: {ready: true}}
        ]);
    });

    test('simple1', (done) => {
        const source = stream(null, function (emt) {
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
        } );

        const assertions = [
            {data: 0},
            {data: 0},
            {data: 1},
            {data: 3},
            {data: 6},
        ];

        const reducer = new Reducer(source, (acc, next) => {
            return acc + next;
        }, 0);

        streamEqualStrict(done, reducer, assertions);
    });
*/
    test('several disconnect', (done) => {
        const source = stream(null, function (e) {
            e(0);
        } );

        const store = source
          .reduceF( { count: 0 }, ( { count } ) =>  ({ count: count + 1 })  );

        const one = store.on( () => {} );
        const two = store.on( () => {} );

        debugger;

        one();
        two();

        done();

    });

/*
    it('abort action', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 0 ),
            evt => expect(evt).to.deep.equal( 1 ),
            evt => expect(evt).to.deep.equal( 3 ),
            evt => expect(evt).to.deep.equal( 6 ),
            evt => expect(evt).to.deep.equal( keyF ),
            evt => expect(evt).to.deep.equal( 5 ),
            evt => expect(evt).to.deep.equal( 9 ),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
            setTimeout(() => {
                emt(keyA, { is: { abort: true }, rid: 1 });
                emt(4, { rid: 4 });
            }, 0);
        } );

        source
            .reducer( (acc, next) => {
                return acc + next;
            } )
            .on( done );

    });
*/
/*
    it('refresh history', (done) => {

        done = series(done, [
            evt => expect(evt).to.deep.equal( keyF ),
        ]);

        const source = new Observable( function (emt) {
            emt.kf();
            emt(0, { rid: 0 });
            emt(1, { rid: 1 });
            emt(2, { rid: 2 });
            emt(3, { rid: 3 });
            emt.kf();
            emt(keyA, { is: { abort: true }, rid: 1 });
        } );

        source
            .reducer( (acc, next) => {
                return acc + next;
            } )
            .on( done );

    });*/

});