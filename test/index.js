import chaiSubset from 'chai-subset'
import chai from "chai"
chai.use(chaiSubset);

//очистить консоль (только для os терминала)
console.log('\x1Bc');

//import "../src/observable/test/index.js"
//import "../src/socket/test/index.js"
import "../src/stream2/test/index.mjs"