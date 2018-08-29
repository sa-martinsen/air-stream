import Observable from "../observable/index.mjs"
import Collector from "./collector.mjs"

export default creator =>
    new Observable( emt => {
        const sweep = new Collector();
        const hook = new Collector();
        const over = new Collector();

        const requester = { dissolve: [] };
        const request = (arg) => {
            if(typeof arg === "object") {
                Object.keys(arg).map(key => {
                    if(!requester.hasOwnProperty(key)) requester[key] = [];
                    requester[key].push(arg[key]);
                });
            }
            else if( typeof arg === "function" ) {
                requester.dissolve.push( arg );
            }
            else {
                requester.dissolve.push(() => clearImmediate(arg));
            }
        };

        request.exec = ({ request, ...args } = {}) => {
            if(requester.hasOwnProperty(args.request)) {
                requester[request].map(k=>k({ ...args, dissolve: false }));
            }
        };

        const res = creator( emt, { sweep, hook, over, request } );
        if(typeof res === "function") sweep.add( res );
        return ({dissolve = false, ...args} = {dissolve: true}) => {
            if(dissolve) {
                requester.dissolve.map(k => k( { dissolve: true } ));
                sweep.use( { dissolve } );
            }
            else {
                if(args.hasOwnProperty("request") && requester.hasOwnProperty(args.request)) {
                    requester[args.request].map(k=>k({ ...args, dissolve }));
                }
                hook.use( { dissolve, ...args });
            }
            over.use( { dissolve, ...args });
        }
    } );