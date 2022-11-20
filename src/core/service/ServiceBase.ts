import { EventEmitter } from "events"

import { NodeConf } from "../node/NodeConf"
import { Bus } from "../path/Bus"
import { nodePath } from "../utils"
import { IAction } from "../node/IAction"
import { IEvent, IListener, ServiceBaseActions, ServiceBaseEvents } from "./utils"

// bisogna importarlo direttamente da "utils" altrimenti c'e' un import-circolare
import { Actions as ErrorActions } from "../../services/error/utils"
import { Errors } from "."


/**
 * E' la classe base di tutti i Service
 * Gestisce gli eventi
 */
export class ServiceBase extends NodeConf {

	constructor(name?: string, conf?: any) {
		super(name, conf)
		this._emitter = new EventEmitter()
	}


	get emitter(): EventEmitter {
		return this._emitter
	}
	private _emitter: EventEmitter


	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ServiceBaseActions.REGISTER]: async (state, name, sender) => this.register({ event: name, path: sender }),
			[ServiceBaseActions.UNREGISTER]: async (state, name, sender) => this.unregister({ event: name, path: sender }),
			[ServiceBaseActions.EVENT]: async (state, payload) => this.onEvent(payload),
		}
	}

	private listeners: IListener[] = []

	/**
	 * Registro il "listener" agli eventi del Node
	 * @param listener 
	 */
	protected register(listener: IListener): void {
		const index = this.listeners.findIndex(l => listenersIsEqual(l, listener))
		if (index != -1) return
		this.listeners.push(listener)
	}

	/**
	 * Elimino il "listener" della ricezione degli eventi del Node
	 */
	private unregister(listener: IListener): void {
		const newListeners = this.listeners.filter(l => !listenersIsEqual(l, listener))
		this.listeners = newListeners
	}

	/**
	 * Quando arriva un evento di un altro Node
	 * @param event 
	 */
	protected onEvent(event: IEvent): void { }

	/**
	 * emette un evento a tutti i "listeners"
	 * @param event 
	 * @param arg 
	 */
	private emit(event: string, arg?: any) {
		if ( !this.listeners ) return
		for (const listener of this.listeners) {
			if (listener.event != event) continue
			new Bus(this, listener.path).dispatch({
				type: ServiceBaseActions.EVENT,
				payload: <IEvent>{
					source: nodePath(this),
					name: event,
					arg,
				},
			})
		}
	}

	/**
	 * emette un ACTION a tutti i "listeners"
	 * @param action 
	 * @returns 
	 */
	async dispatch(action: IAction): Promise<any> {
		const res = await super.dispatch(action)
		this._emitter.emit(ServiceBaseEvents.DISPATCH, action)
		return res
	}

	/**
	 * Chiamato quando cambia lo stato del NODE ed emette l'evento "STATE_CHANGE"
	 * @override
	 * @param old 
	 */
	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.emit(ServiceBaseEvents.STATE_CHANGE, this._state)
	}

	/**
	 * Chiamto quando il NODE viene inizializzato  
	 * Emette l'evento "INIT"
	 * @override
	 * @param conf 
	 * @returns 
	 */
	protected async onInit(conf:any): Promise<void> {
		try {
			await super.onInit(conf)
		} catch (error) {
			new Bus(this, "/error").dispatch({ 
				type: ErrorActions.NOTIFY, 
				payload: { code: Errors.INIT, error } 
			})
			return
		}
		this.emit(ServiceBaseEvents.INIT)
	}

	/**
	 * Chiamata DOPO la creazione dei CHILDREN  
	 * Emette l'evento "INIT_AFTER"
	 */
	protected async onInitAfter(): Promise<void> {
		await super.onInitAfter()
		this.emit(ServiceBaseEvents.INIT_AFTER)
	}

	protected async onDestroy(): Promise<void> {
		await super.onDestroy()
		this.emit(ServiceBaseEvents.DESTROY)
	}
}

/**
 * Determina se due `Listener` hanno le stesse proprietà
 * @param listener1 
 * @param listener2 
 * @returns 
 */
function listenersIsEqual(listener1: IListener, listener2: IListener): boolean {
	return listener1.path == listener2.path && listener1.event == listener2.event
}