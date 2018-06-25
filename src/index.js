import "./set_immediate"
import Observable from "./observable"
export {default as Observable} from "./observable"
export {default as Stream, keyF, keyA} from "./observable"
export const stream = (...args) => new Observable(...args);
export const combine = Observable.combine;
export const merge = Observable.merge;