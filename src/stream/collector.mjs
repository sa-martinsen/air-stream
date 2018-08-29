export default class Collector {

    constructor() {
        this._item = [];
    }

    add( ...args ) {
        this._item.push(...args);
    }

    del( ...args ) {
        args.map( x => {
            const ex = this._item.indexOf(x);
            if(ex < 0) throw "attempt to remove a nonexistent hook";
            this._item.splice(ex, 1)
        } );
    }

    force( ...args ) {
        this.del( ...args );
        Collector.use(args, { dissolve: true });
    }

    static use( item, { dissolve = false, ...args } = {  dissolve: true } ) {
        item.map( x => x({ dissolve , ...args} ) );
    }

    use( args ) {
        Collector.use(this._item, args);
    }

}