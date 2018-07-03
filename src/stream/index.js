import Observable from "../observable"
import Collector from "./collector"

export default creator =>
    new Observable( emt => {
        const sweep = new Collector();
        const hook = new Collector();
        const over = new Collector();
        const res = creator( emt, { sweep, hook, over } );
        if(typeof res === "function") sweep.add( res );
        return ({dissolve = false, ...args} = {dissolve: true}) => {
            if(dissolve) {
                sweep.use( { dissolve: true } );
                over.use( { dissolve: true } );
            }
            else {
                hook.use( { dissolve: false, ...args });
            }
        }
    } );