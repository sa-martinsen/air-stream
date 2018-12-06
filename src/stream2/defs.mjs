const { freeze } = Object;
export const keyF = freeze({ keyF: "keyF" });
export const keyA = freeze({ keyA: "keyA" });
export const keys = [ keyF, keyA ];
export let MERT /*MAX_EVENT_RETENTION_TIME_MS**/ = 3000;

let __rid = 0;
export const rid = () => __rid++;

export const _MERT_SETUP_ = ms => MERT = ms;