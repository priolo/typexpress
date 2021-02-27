import { NodeConf } from "./node/NodeConf"
import { Bus } from "./path/Bus"
import { nodePath } from "./utils"


export enum ServiceBaseActions {
	REGISTER = "event:register",
	UNREGISTER = "event:unregister",
	EVENT = "event:arrived",
}

export enum ServiceBaseEvents {
	STATE_CHANGE = "state:change",
	INIT = "node:init",
	INIT_AFTER = "node:init-after",
	DESTROY = "node:destroy",
}

export interface IListener {
	path: string,
	event: string
}
export interface IEvent {
	source: string,	// NODE dove è stato creato l'evento
	name: string,	// nome dell'evento
	arg?: any,		// payload
}

function listenersIsEqual(listener1: IListener, listener2: IListener): boolean {
	return listener1.path == listener2.path && listener1.event == listener2.event
}

/**
 * E' la classe base di tutti i Service
 * Gestisce gli eventi
 */
export class ServiceBase extends NodeConf {

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ServiceBaseActions.REGISTER]: async (state, name, sender) => this.register({event:name, path:sender}),
			[ServiceBaseActions.UNREGISTER]: async (state, name, sender) => this.unregister({event:name, path:sender}),
			[ServiceBaseActions.EVENT]: async (state, payload) => this.onEvent(payload),
		}
	}

	private listeners: IListener[] = []

	private register(listener:IListener): void {
		const index = this.listeners.findIndex(l => listenersIsEqual(l, listener))
		if (index != -1) return
		this.listeners.push(listener)
	}

	private unregister(listener: IListener): void {
		const newListeners = this.listeners.filter(l => !listenersIsEqual(l, listener))
		this.listeners = newListeners
	}

	protected onEvent(event: IEvent): void { }

	public emit(event: string, arg?: any) {
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

	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.emit(ServiceBaseEvents.STATE_CHANGE, this._state)
	}

	protected async onInit(): Promise<void> {
		await super.onInit()
		this.emit(ServiceBaseEvents.INIT)
	 }

	protected async onInitAfter(): Promise<void> { 
		await  super.onInitAfter()
		this.emit(ServiceBaseEvents.INIT_AFTER)
	}

	protected async onDestroy(): Promise<void> { 
		await super.onDestroy()
		this.emit(ServiceBaseEvents.DESTROY)
	}
}