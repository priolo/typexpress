import { EventEmitter } from "events"
import { NodeConf } from "../node/NodeConf.js"
import { EventsLogsBase, IAction, ILog, TypeLog } from "../node/types.js"



/**
 * E' la classe base di tutti i Service
 * Gestisce gli eventi
 */
export class ServiceBase extends NodeConf {

	constructor(name?: string, state?: any) {
		super(name, state)
		this._emitter = new EventEmitter()
	}

	/**
	 * Permette di emettere un evento
	 * serve per oggetti esterni ai nodi
	 */
	get emitter(): EventEmitter {
		return this._emitter
	}
	private _emitter: EventEmitter


	/**
	 * Contiene le ACTIONs eseguibili
	 */
	// get executablesMap() {
	// 	return {
	// 		...super.executablesMap,
	// 		[ServiceBaseActions.START]: async () => await this.serviceStart(),
	// 		[ServiceBaseActions.STOP]: async () => await this.serviceStop(),
	// 	}
	// }

	// get stateDefault() {
	// 	return {
	// 		...super.stateDefault,
	// 		onInit: <() => void>null,
	// 		onInitAfter: <() => void>null,
	// 		onDestroy: <() => void>null,
	// 	}
	// }

	/**
	 * trasmette al parent un log
	 * @override
	 */
	emitLog(log: ILog) {
		this.emitter.emit(log.name, log)
		super.emitLog(log)
	}

	/**
	 * emette un ACTION a tutti i "listeners"
	 * @override 
	 */
	async execute(action: IAction): Promise<any> {
		try {
			const res = await super.execute(action)
			this.log(EventsLogsBase.NODE_EXECUTE, action)
			return res
		} catch (error) {
			this.log(EventsLogsBase.ERR_EXECUTE, error, TypeLog.ERROR)
		}
	}

	/**
	 * Chiamato quando cambia lo stato del NODE ed emette l'evento "STATE_CHANGE"
	 * @override
	 */
	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.log(EventsLogsBase.STATE_CHANGE, this._state)
	}

	/**
	 * Chiamto quando il NODE viene inizializzato  
	 * Emette l'evento "INIT"
	 * @override
	 */
	protected async onInit(): Promise<void> {
		try {
			await super.onInit()
		} catch (error) {
			this.log(EventsLogsBase.ERR_INIT, error, TypeLog.ERROR)
			return
		}
		this.log(EventsLogsBase.NODE_INIT)
	}

	/**
	 * Chiamata DOPO la creazione dei CHILDREN  
	 * Emette l'evento "INIT_AFTER"
	 * @override
	 */
	protected async onInitAfter(): Promise<void> {
		await super.onInitAfter()
		this.log(EventsLogsBase.NODE_INIT_AFTER)
	}

	protected async onDestroy(): Promise<void> {
		await super.onDestroy()
		this.log(EventsLogsBase.NODE_DESTROY)
	}
}
