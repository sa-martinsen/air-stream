import { keyF } from "./defs.mjs"

export default class Emitter {

    constructor( source ) {
        const { reactor } = source;
        reactor({
            emt(data, src) {
                source.emit(data, src)
            },
            kf(src) {
                source.emit(keyF, src)
            }
        });
    }

}