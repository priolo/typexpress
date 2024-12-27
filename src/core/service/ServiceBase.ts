import { EventEmitter } from "events"
import { Actions as ErrorActions } from "../../services/error/utils.js"
import { NodeConf } from "../node/NodeConf.js"
import { IAction } from "../node/utils.js"
import { Bus } from "../path/Bus.js"
import { Errors, IChildLog, ServiceBaseLogs } from "./utils.js"



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
	emitLog(log: IChildLog) {
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
			this.log(ServiceBaseLogs.DISPATCH, action)
			return res
		} catch (error) {
			(await import("../../services/error/ErrorService.js")).default?.Send(this, error)
		}
	}

	/**
	 * Chiamato quando cambia lo stato del NODE ed emette l'evento "STATE_CHANGE"
	 * @override
	 */
	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.log(ServiceBaseLogs.STATE_CHANGE, this._state)
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
			new Bus(this, "/error").dispatch({
				type: ErrorActions.NOTIFY,
				payload: { code: Errors.INIT, error }
			})
			return
		}
		this.log(ServiceBaseLogs.INIT)
	}

	/**
	 * Chiamata DOPO la creazione dei CHILDREN  
	 * Emette l'evento "INIT_AFTER"
	 * @override
	 */
	protected async onInitAfter(): Promise<void> {
		await super.onInitAfter()
		this.log(ServiceBaseLogs.INIT_AFTER)
	}

	protected async onDestroy(): Promise<void> {
		await super.onDestroy()
		this.log(ServiceBaseLogs.DESTROY)
	}
}
