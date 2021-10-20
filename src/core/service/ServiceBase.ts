import { EventEmitter } from "events"

import { NodeConf } from "../node/NodeConf"
import { Bus } from "../path/Bus"
import { nodePath } from "../utils"
import { IAction } from "../node/utils"
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

	protected register(listener: IListener): void {
		const index = this.listeners.findIndex(l => listenersIsEqual(l, listener))
		if (index != -1) return
		this.listeners.push(listener)
	}

	private unregister(listener: IListener): void {
		const newListeners = this.listeners.filter(l => !listenersIsEqual(l, listener))
		this.listeners = newListeners
	}

	protected onEvent(event: IEvent): void { }

	private emit(event: string, arg?: any) {
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

	async dispatch(action: IAction): Promise<any> {
		const res = await super.dispatch(action)
		this._emitter.emit(ServiceBaseEvents.DISPATCH, action)
		return res
	}

	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.emit(ServiceBaseEvents.STATE_CHANGE, this._state)
	}

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