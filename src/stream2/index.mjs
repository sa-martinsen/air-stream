import Observable, {keyA} from 'air-stream/src/observable/index';
import getTTMP from "./get-ttmp"

const EMPTY_OBJECT = Object.freeze({ empty: 'empty' });
const STATIC_PROJECTS = {
	STRAIGHT: data => data,
	AIO: (...args) => args,
};

export class Stream2 {
	
	constructor(sourcestreams, project, ctx = null) {
		this.subscribers = [];
		this.project = project;
		this.ctx = ctx;
		this.sourcestreams = sourcestreams;
		this.controller = this.createController();
	}
	
	static fromevent(target, event) {
		return new Stream2( [], (e, controller) => {
			target.addEventListener( event, e );
			controller.todisconnect( () => target.removeEventListener( event, e ));
		});
	}
	
	static merge(sourcestreams, project) {
		return new Stream2( [], (e, controller) => {
			controller.todisconnect(...sourcestreams.map( stream => stream.on( e ) ));
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
		this._activate( subscriber );
		return ({ disconnect = false, ...args } = { disconnect: true }) => {
			if(disconnect) {
				const removed = this.subscribers.indexOf(subscriber);
				/*<@debug>*/
				if(removed < 0) throw `Attempt to delete an subscriber out of the container`;
				/*</@debug>*/
				this.subscribers.splice(removed, 1);
			}
			this.controller.send({
				//todo cross ver support
				dissolve: disconnect,
				disconnect, ...args
			});
		}
	}

	at(subscriber) {
		return this.on( (data, record) => {
			if(Observable.keys.includes(data)) {
				return ;
			}
			subscriber( data, record );
		} );
	}
	
	connectable() {
		return new Connectable( this );
	}
	
	map(project) {
		return new Stream2(null, (e, controller) => {
			controller.to(this.on( (data, record) => {
				if(Observable.keys.includes(data, record)) {
					return e(data, record);
				}
				e(project(data), record);
			} ));
		});
	}
	
	filter(project) {
		return new Stream2(null, (e, controller) => {
			controller.to(this.on( (data, record) => {
				if(Observable.keys.includes(data, record)) {
					return e(data, record);
				}
				const res = e(project(data));
				res && e(data, record);
			} ));
		});
	}
	
	distinct(equal) {
		return new Stream2(null, (e, controller) => {
			let state = EMPTY_OBJECT;
			controller.to(this.on( (data, record) => {
				if(Observable.keys.includes(data, record)) {
					if(data === keyA) {
						state = EMPTY_OBJECT;
					}
					return e(data, record);
				}
				else if(state === EMPTY_OBJECT) {
					state = data;
					e(data, record);
				}
				else if(!equal(state, data)) {
					state = data;
					e(data, record);
				}
			} ));
		});
	}
	
	_activate( subscriber ) {
		const emmiter = this.createEmitter( subscriber );
		this.project.call(this.ctx, emmiter, this.controller);
	}
	
	createEmitter( subscriber ) {
		return (data, record = { ttmp: getTTMP() }) => {
			/*<@debug>*/
			if(!this.subscribers.includes(subscriber)) {
				throw "More unused stream continues to emit data";
			}
			/*</@debug>*/
			
			//todo temporary cross ver support
			if(Observable.keys.includes(data)) {
				return ;
			}
			
			subscriber(data, record );
		};
	}
	
	createController(  ) {
		return new Controller(  );
	}
	
	static sync (sourcestreams, equal, poject = STATIC_PROJECTS.AIO) {
		return this
			.combine(sourcestreams)
			.withHandler((e, streams) => {
				if (streams.length > 1) {
					if (streams.every(stream => equal(streams[0], stream))) {
						e(poject(...streams));
					}
				} else if (streams.length > 0) {
					if (equal(streams[0], streams[0])) {
						e(poject(...streams));
					}
				} else {
					e(poject());
				}
			});
	}
	
	withHandler (handler) {
		return new Stream2(null, (e, controller) =>
			controller.to(this.on((evt, record) => {
				if (Observable.keys.includes(evt)) {
					return e(evt, record);
				}
				const _e = (evt, _record) => e(evt, _record || record);
				return handler(_e, evt);
			}))
		);
	}
	
	static combine(sourcestreams, project = (...streams) => streams) {
		if(!sourcestreams.length) {
			return new Stream2( null, (e) => {
				e(project());
			} );
		}
		return new Stream2( sourcestreams, (e, controller) => {
			const sourcestreamsstate = new Array(sourcestreams.length).fill( EMPTY_OBJECT );
			controller.to( ...sourcestreams.map( (stream, i) => {
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
	
	withlatest(sourcestreams = [], project = STATIC_PROJECTS.AIO) {
		return new Stream2( null, (e, controller) => {
			const sourcestreamsstate = new Array(sourcestreams.length).fill( EMPTY_OBJECT );
			controller.todisconnect( ...sourcestreams.map( (stream, i) => {
				return stream.on( (data, record) => {
					if(Observable.keys.includes(data)) {
						return e( data, record );
					}
					sourcestreamsstate[i] = data;
				} );
			} ) );
			controller.to( this.on( (data, record) => {
				if(Observable.keys.includes(data)) {
					return e( data, record );
				}
				if(!sourcestreamsstate.includes(EMPTY_OBJECT)) {
					e(project(data, ...sourcestreamsstate), record);
				}
			} ) );
		} );
	}
	
	log() {
		return new Stream2( this, (e, controller) => {
			controller.to(this.on((data, record) => {
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
			controller.todisconnect( () => clearInterval(sid) );
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
stream2.sync = Stream2.sync;

export class Controller {
	
	constructor() {
		this.disconnected = false;
		this._todisconnect = [];
		this._tocommand = [];
		this._to = [];
	}
	
	todisconnect(...connectors) {
		this._todisconnect.push(...connectors);
	}
	
	to(...connectors) {
		this._to.push(...connectors);
	}
	
	tocommand( ...connectors ) {
		this._tocommand.push( ...connectors );
	}

	send( data ) {
		if(data.disconnect) {
			this.disconnected = true;
			this._todisconnect.map( connector => connector(data) );
		}
		else {
			this._tocommand.map( connector => connector(data) );
		}
		this._to.map( connector => connector(data) );
	}

}

export class Connectable extends Stream2 {
	
	constructor( sourcestreams ) {
		super(sourcestreams, (e, controller) => {
			controller.to( sourcestreams.on(e) );
		});
		this._activations = [];
	}
	
	connect() {
		this._activations.map( subscriber => super._activate(subscriber) );
	}
	
	_activate( subscriber ) {
		this._activations.push( subscriber );
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
					controller.to(state.on( e ));
				}
				else {
					const msg = [ state, { ttmp: getTTMP() } ];
					this.quene.push(msg);
					e( ...msg );
				}
			}
			if(sourcestreams) {
				controller.todisconnect(sourcestreams.on( (data, record ) => {
					state = project(state, data);
					this.quene.push([ state, record ]);
					if(this.quene.length > 1) {
						this._normilizeQuene();
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
	
	_activate() {
		if(!this._activated) {
			super._activate();
		}
		this._activated = true;
	}
	
	_normilizeQuene() {
		const currentTTMP = getTTMP();
		let firstUnobseloteMSGIndex = this.quene
			.findIndex( ( [, {ttmp}]) => ttmp > currentTTMP - MAX_MSG_LIVE_TIME_MS );
		if(firstUnobseloteMSGIndex === this.quene.length - 1) {
			firstUnobseloteMSGIndex -- ;
		}
		if(firstUnobseloteMSGIndex > 0) {
			this.quene.splice( 0, firstUnobseloteMSGIndex + 1);
		}
		else {
			this.quene.splice( 0, this.quene.length - 1);
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

const MAX_MSG_LIVE_TIME_MS = 7000;