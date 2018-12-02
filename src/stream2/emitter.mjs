import { keyF } from "./defs.mjs"

export default class Emitter {

    constructor( source ) {
        this.source = source;
        const req = source._producer({
            req: source._handler,
            emt: (data, src) => source.emit(data, src),
            kf: (src) => source.emit(keyF, src)
        });
        req && source._handler.on(req);
    }

}