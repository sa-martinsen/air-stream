import chaiSubset from 'chai-subset';
import chai from "chai"
chai.use(chaiSubset);

//очистить консоль (только для os терминала)
console.log('\x1Bc');

import "../src/observable/test/index.mjs"