import { stream2 as stream } from '../index';
import {series} from "../../utils.mjs"

describe('connect', function () {
	
	test('connectable stream self-hooked', (done) => {
		
		done = series(done, [ ]);
		
		const source = stream( null, emt => {
			hook();
		} );
		
		let hook = null;
		
		(hook = source.connectable( done )).connect();
		
	});
	
});