let cache = -1;
export default function getTTMP() {
	if(cache === -1) {
		cache = _getTTMP();
		setTimeout( () => {
			cache = -1;
		} );
	}
	return cache;
}

let _getTTMP = null;
if(globalThis.performance) {
	_getTTMP = () => globalThis.performance.now() | 0;
}
else {
	_getTTMP = () => process.hrtime.bigint();
}