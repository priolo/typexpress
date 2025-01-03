import { NodeConf } from "../node/NodeConf.js"
import { EventsLogsBase, IAction, ILog, TypeLog } from "../node/types.js"
import { EventEmitter } from "@priolo/jon-utils"



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
}
