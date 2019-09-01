import {describe, it} from "mocha"
import { merge, stream, keyF } from "../../index.mjs"
import {expect} from "chai"
import {series} from "../../utils.mjs"

describe('connect', function () {
	
	it('connectable stream self-hooked', (done) => {
		
		done = series(done, [ ]);
		
		const source = stream( emt => {
			hook();
		} );
		
		let hook = null;
		
		(hook = source.connectable( done )).connect();
		
	});
	
});