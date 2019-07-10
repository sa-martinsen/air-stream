import Observable from '../observable/index.mjs';
import Collector from './collector.mjs';

export default (creator, ctx = null) =>
  new Observable(emt => {
    const sweep = new Collector();
    const hook = new Collector();
    const over = new Collector();

    const requester = { dissolve: [] };
    const request = (arg) => {
      if (typeof arg === 'object') {
        Object.keys(arg).map(key => {
          if (!requester.hasOwnProperty(key)) requester[key] = [];
          requester[key].push(arg[key]);
        });
      } else if (typeof arg === 'function') {
        requester.dissolve.push(arg);
      } else {
        requester.dissolve.push(() => clearImmediate(arg));
      }
    };

    request.exec = ({ request, ...args } = {}) => {
      if (requester.hasOwnProperty(request)) {
        requester[request].map(k => k({ ...args, dissolve: false }));
      }
    };

    request.force = (request) => {
      Object.keys(requester)
        .map(type => requester[type])
        .some(req => {
          const index = req.indexOf(request) > -1;
          if (index) {
            return req.splice(index, 1);
          }
        });
    };

    const res = creator.call(ctx, emt, { sweep, hook, over, request });
    if (typeof res === 'function') sweep.add(res);
    return ({ dissolve = false, action = null, request = action, ...args } = { dissolve: true }) => {
      if (dissolve) {
        requester.dissolve.map(k => k({ dissolve: true }));
        sweep.use({ dissolve });
      } else {
        if (request && requester.hasOwnProperty(request)) {
          requester[request].map(k => k({ ...args, request, dissolve }));
        }
        hook.use({ action, dissolve, ...args });
      }
      over.use({ request, action, dissolve, ...args });
    };
  });