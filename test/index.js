import chaiSubset from 'chai-subset'
import chai from "chai"
import "../src/polyfills/index.mjs"
chai.use(chaiSubset);

//очистить консоль (только для os терминала)
console.log('\x1Bc');

//import "../src/observable/test/index.mjs"
//import "../src/socket/test/index.mjs"

import "../src/stream2/test/index.mjs"