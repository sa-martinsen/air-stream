export default class Collector {

    constructor() {
        this._item = [];
    }

    add( ...args ) {
        this._item.push(...args);
    }

    del( ...args ) {
        args.map( x => this._item.splice(this._item.indexOf(x), 1) );
    }

    force( ...args ) {
        Collector.use(args, { dissolve: true });
        this.del( ...args );
    }

    static use( item, { dissolve = false, ...args } = {  dissolve: true } ) {
        item.map( x => x({ dissolve , ...args} ) );
    }

    use( args ) {
        Collector.use(this._item, args);
    }

}