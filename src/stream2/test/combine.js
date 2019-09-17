import { stream2 as stream } from '../index';
import { streamEqualStrict } from '../../utils';

describe('combine', () => {

    test('simple1', (done) => {
        const expected = [
            { data: [2, 1] },
            { data: [3, 1] },
            { data: [3, 2] },
            { data: [4, 2] },
            { data: [4, 3] },
            // { disconnect: true },
        ];
        const source1 = stream([], function (e) {
            e({ a: 1 });
            setTimeout(() => e(2), 200);
            setTimeout(() => e(3), 300);
            setTimeout(() => e(4), 400);
        });
        const source2 = stream([], function (e) {
            setTimeout(() => e(1), 250);
            setTimeout(() => e(2), 300);
            setTimeout(() => e(3), 400);
        });
        const combined = stream.combine([source1, source2]);
        streamEqualStrict(done, combined, expected);
    });

    test('simple2', (done) => {
        const assertions = [
            {data: [1, 2]},
            {data: [1, 3]},
            {data: [4, 3]},
            {data: [5, 3]},
            {data: [5, 6]},
        ];
        const source = stream(null, function (emt) {
            emt({count: 1, path: "a"});
            emt({count: 2, path: "b"});
            emt({count: 3, path: "b"});
            emt({count: 4, path: "a"});
            emt({count: 5, path: "a"});
            emt({count: 6, path: "b"});
        });
        const a = source.filter( ({path}) => path === "a" );
        const b = source.filter( ({path}) => path === "b" );
        streamEqualStrict(
            done,
            stream.combine([a, b], ({count: a}, {count: b}) => [a, b] ),
            assertions,
        );
    });

    test('simple disconnect', (done) => {
        const source1 = stream([], function (e, controller) {
            e(1);
            const sid = setTimeout(() => e(2));
            controller.todisconnect( () => clearTimeout(sid) );
        });
        const source2 = stream([], function (e, controller) {
            e(2);
            const sid = setTimeout(() => e(1));
            controller.todisconnect( () => clearTimeout(sid) );
        });
        const combined = stream.combine([source1, source2]);
        combined.on( ([a, b]) => { } )();
        setTimeout( done, 10 );

    });

	test('empty source combiner', (done) => {
		const combined = stream.combine([]);
		streamEqualStrict(done, combined, [ { data: [] } ]);
	});

    test('to many streams', (done) => {
        const a = stream(null, function (emt) {
            emt("a");
            emt("b");
            emt("c");
            setTimeout(() => emt("d"), 10);
        });
        const b = stream(null, function (emt) {
            emt("c");
            emt("d");
            setTimeout(() => emt("e"), 10);
        });
        const c = stream(null, function (emt) {
            emt("c");
            setTimeout(() => emt("d"), 10);
        });
        const d = stream(null, function (emt) {
            emt("a");
            emt("b");
            emt("d");
        });
        streamEqualStrict(
            done,
            stream.combine([a, b, c, d].map(obs => obs.filter(v => v === "d"))),
            [{data: ["d", "d", "d", "d"]}],
        );
    });

    test('loop', (done) => {
        const assertions = [
            // {data: ["b1", "b", "b"]},
            {data: ["b1", "b", "c"]},
            {data: ["c1", "b", "c"]},
        ];
        const source = stream(null, function (emt) {
            emt("a");
            emt("b");
            emt("c");
        });
        const a = source.map( evt => evt + "1");
        const b = source.filter( evt => evt === "b");
        streamEqualStrict(done, stream.combine([a, b, source] ), assertions);
    });

    // test('combine key', (done) => {
    //
    //     done = series(done, [
    //         evt => expect(evt).to.deep.equal(keyF),
    //     ]);
    //
    //     const source = stream(function (emt) {
    //         emt.kf();
    //     });
    //
    //     const a = source.filter( ({path}) => path === "a" );
    //     const b = source.filter( ({path}) => path === "b" );
    //
    //     combine([a, b], ({count: a}, {count: b}) => [a, b] ).on( done );
    //
    // });
});