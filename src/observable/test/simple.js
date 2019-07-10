import Observable from "../index.mjs"

function pusher(sequence) {
    return data => sequence.push(data);
}

describe('Observable', () => {

    describe('log', () => {

        const source = new Observable(function (emt) {
            emt.emit({count: 2, path: "a"});
            emt.emit({acc: 4, path: "c"});
            emt.emit({weight: 3, path: "b"});
        });

        test('simple', (done) => {
            source.log();
            done();
        });

    });

    describe('combination', () => {

        test('unsubscribe', (done) => {
            const source = new Observable(function (emt) {
                emt.emit({type: "reinit", weight: 2, path: "a"});
                emt.emit({type: "reinit", weight: 3, path: "a"});
                emt.emit({type: "reinit", weight: 3, path: "b"});
                emt.emit({type: "reinit", weight: 4, path: "a"});
                return done;
            });
            let a = source
                .filter( ({path}) => path === "a" )
                .map( ({weight, ...args}) => ({weight: weight + "77", ...args}) );
            let obs = a.on( evt => {} );
            obs();
            expect(!source.obs.length).toBe(0);
        });

    });

});