import Observable from 'air-stream/src/observable/index';

const EMPTY_OBJECT = Object.freeze({ empty: 'empty' });
const STATIC_PROJECTS = { STRAIGHT: data => data };

export class Stream2 {
	
	constructor(sourcestreams, project, ctx = null) {
		this.subscribers = [];
		this.project = project;
		this.ctx = ctx;
		this.sourcestreams = sourcestreams;
	}
	
	static fromevent(target, event) {
		return new Stream2( [], (e, controller) => {
			target.addEventListener( event, e );
			controller.ondisconnect( () => target.removeEventListener( event, e ));
		});
	}
	
	static merge(sourcestreams, project) {
		return new Stream2( [], (e, controller) => {
			controller.ondisconnect(...sourcestreams.map( stream => stream.on( e ) ));
		});
	}
	
	reduceF(state, project) {
		return new Reducer( this, project, state);
	}

	/**
	 * @param {Promise} source - Input source
	 * @param {Function} project - Mapper project function
	 * @returns {Stream2}
	 */
	static from(source, project) {
		if(source instanceof Promise) {
			return this.fromPromise(source, project);
		}
		throw new TypeError("Unsupported source type");
	}

	static fromPromise(source, project = STATIC_PROJECTS.STRAIGHT) {
		return new Stream2(null, (e, controller) => {
			source.then( data => {
				if(!controller.disconnected) {
					e(project(data));
				}
			} );
		});
	}

	store() {
		return new Reducer( null, null, this );
	}
	
	on( subscriber ) {
		this.subscribers.push(subscriber);
		const controller = this._activate( subscriber );
		return ({ disconnect = false, ...args } = { disconnect: true }) => {
			if(disconnect) {
				const removed = this.subscribers.indexOf(subscriber);
				/*<@debug>*/
				if(removed < 0) throw `Attempt to delete an subscriber out of the container`;
				/*</@debug>*/
				this.subscribers.splice(removed, 1);
			}
			controller.send({
				//todo cross ver support
				dissolve: disconnect,
				disconnect, ...args
			});
		}
	}
	
	_activate( subscriber ) {
		const emmiter = this.createEmitter( subscriber );
		const controller = this.createController( subscriber );
		this.project.call(this.ctx, emmiter, controller);
		return controller;
	}
	
	createEmitter( subscriber ) {
		return (data, record = { ttmp: getTTMP() }) => {
			/*<@debug>*/
			if(!this.subscribers.includes(subscriber)) {
				throw "More unused stream continues to emit data";
			}
			/*</@debug>*/
			subscriber(data, record );
		};
	}
	
	createController( subscriber ) {
		return new Controller( subscriber );
	}
	
	static combine(sourcestreams, project = (...streams) => streams) {
		return new Stream2( sourcestreams, (e, controller) => {
			const sourcestreamsstate = new Array(sourcestreams.length).fill( EMPTY_OBJECT );
			controller.onfullproxy( ...sourcestreams.map( (stream, i) => {
				return stream.on( (data, record) => {
					if(Observable.keys.includes(data)) {
						return e( data, record );
					}
					sourcestreamsstate[i] = data;
					if(!sourcestreamsstate.includes(EMPTY_OBJECT)) {
						e(project(...sourcestreamsstate), record);
					}
				} );
			} ) );
		} );
	}
	
	log() {
		return new Stream2( this, (e, controller) => {
			controller.onfullproxy(this.on((data, record) => {
				console.log(data);
				e(data, record);
			}));
		});
	}
	
	static ups(UPS = 100) {
		const factor = UPS / 1000;
		return new Stream2( [], (e, controller) => {
			let globalCounter = 0;
			const startttmp = getTTMP();
			const sid = setInterval(() => {
				const current = getTTMP();
				const count = (current - startttmp) * factor - globalCounter|0;
				if(count > 10000) throw "Uncounted err";
				for (let i = 0; i < count; i++) {
					globalCounter++;
					e(globalCounter, { ttmp: startttmp + globalCounter * factor|0 });
				}
			}, 500 / UPS);
			controller.ondisconnect( () => clearInterval(sid) );
		} );
	}
	
}

export const stream2 = (...args) => new Stream2(...args);
stream2.merge = Stream2.merge;
stream2.fromevent = Stream2.fromevent;
stream2.ups = Stream2.ups;
stream2.combine = Stream2.combine;
stream2.from = Stream2.from;
stream2.fromPromise = Stream2.fromPromise;

export class Controller {
	
	constructor() {
		this.disconnected = false;
		this._ondisconnect = [];
		this._onfullproxy = [];
	}
	
	ondisconnect(...connectors) {
		this._ondisconnect.push(...connectors);
	}
	
	onfullproxy(...connectors) {
		this._onfullproxy.push(...connectors);
	}

	send( data ) {
		if(data.disconnect) {
			this.disconnected = true;
			this._ondisconnect.map( connector => connector(data) );
		}
		this._onfullproxy.map( connector => connector(data) );
	}

}

export class Reducer extends Stream2 {

	/**
	 * @param sourcestreams {Stream2|null} Operational stream
	 * @param project {Function}
	 * @param state {Object|Stream2} Initial state (from static or stream)
	 */
	constructor(sourcestreams, project = (_, data) => data, state = EMPTY_OBJECT) {
		super(sourcestreams, (e, controller) => {
			if(state !== EMPTY_OBJECT) {
				if(state instanceof Stream2) {
					controller.ondisconnect(state.on( e ));
				}
				else {
					const msg = [ state, { ttmp: getTTMP() } ];
					this.quene.push(msg);
					e( ...msg );
				}
			}
			if(sourcestreams) {
				controller.ondisconnect(sourcestreams.on( (data, record ) => {
					state = project(state, data);
					this.quene.push([ state, record ]);
					if(this.quene.length > 1) {
						this.normilizeQuene();
					}
					e( state, record );
				} ));
			}
			if(!sourcestreams && !state) {
				/*<@debug>*/
				console.warn("This stream is always empty.");
				/*</@debug>*/
			}
		});
		this._activated = false;
		this.quene = [];
	}
	
	createEmitter( subscriber ) {
		if(!this.emitter) {
			this.emitter = (data, record = { ttmp: getTTMP() }) => {
				this.subscribers.map( subscriber => subscriber(data, record) );
			};
		}
		return this.emitter;
	}
	
	createController( subscriber ) {
		if(!this.controller) {
			this.controller = new Controller();
		}
		return this.controller;
	}
	
	_activate() {
		if(!this._activated) {
			super._activate();
		}
		this._activated = true;
	}
	
	normilizeQuene() {
		const currentTTMP = getTTMP();
		let firstUnobseloteMSGIndex = this.quene
			.findIndex( ( [, {ttmp}]) => ttmp > currentTTMP - MAX_MSG_LIVE_TIME_MS );
		if(firstUnobseloteMSGIndex === this.quene.length - 1) {
			firstUnobseloteMSGIndex -- ;
		}
		if(firstUnobseloteMSGIndex > 0) {
			this.quene.splice( 0, firstUnobseloteMSGIndex + 1);
		}
	}
	
	on( subscriber ) {
		const hook = super.on( subscriber );
		this.quene.map( ([data, record]) =>
			this.subscribers.map(subscriber => subscriber(data, record))
		);
		return hook;
	}

}

function getTTMP() {
	return globalThis.performance && globalThis.performance.now()|0 || process.hrtime.bigint();
}

const MAX_MSG_LIVE_TIME_MS = 7000;