import Observable from "../observable"
import Collector from "./collector"

export default creator =>
    new Observable( emt => {
        const sweep = new Collector();
        const hook = new Collector();
        const res = creator( emt, { sweep, hook } );
        res && res.sweep && sweep.add(res.sweep);
        res && res.hook && hook.add(res.hook);
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