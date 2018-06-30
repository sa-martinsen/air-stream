import Observable from "../observable"
import Collector from "./collector"

export default stream = creator =>
    new Observable( emt => {
        const sweep = new Collector();
        const hook = new Collector();
        const res = creator( emt, { sweep, hook } );
        sweep.add(res.sweep);
        hook.add(res.hook);
        return ({dissolve = false, ...args}) => {
            if(dissolve) {
                sweep.use();
                hook.use();
            }
            else {
                hook.use(args);
            }
        }
    } );