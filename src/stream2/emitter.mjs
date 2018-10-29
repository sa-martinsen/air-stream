export default class Emitter {

    constructor( source ) {
        this.reactor = source.reactor;
        this.handler = source.handler;
        this.source = source;
        reactor({
            emt(data, src) {
                source.emit(data, src)
            }
        });
    }

}