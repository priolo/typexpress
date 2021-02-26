import { NodeConf } from "./node/NodeConf"
import { Bus } from "./path/Bus"


export enum ServiceBaseActions {
	REGISTER = "event:register",
	UNREGISTER = "event:unregister",
	EVENT = "event:arrived",
}

export interface IListener {
	path: string,
	event: string
}
export interface IEvent {
	path: string,
	event: string,
	arg: string,
}

function listenerEqual(listener1: IListener, listener2: IListener): boolean {
	return listener1.path == listener2.path && listener1.event == listener2.event
}

/**
 * E' la classe base di tutti i Service
 * permette la registrazione degli eventi
 */
export class ServiceBase extends NodeConf {

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ServiceBaseActions.REGISTER]: async (state, listener) => this.register(listener),
			[ServiceBaseActions.UNREGISTER]: async (state, listener) => this.unregister(listener),
			[ServiceBaseActions.EVENT]: async (state, payload) => this.event(payload),
		}
	}

	private listeners: IListener[] = []

	private register(listener: IListener): void {
		const index = this.listeners.findIndex(l => listenerEqual(l, listener))
		if (index != -1) return
		this.listeners.push(listener)
	}

	private unregister(listener: IListener): void {
		const newListeners = this.listeners.filter(l => !listenerEqual(l, listener))
		this.listeners = newListeners
	}

	protected event(payload:IEvent ) : void {}

	public emit(event: string, payload: any) {
		for (const listener of this.listeners) {
			if (listener.event != event) continue
			new Bus(this, listener.path).dispatch({
				type: ServiceBaseActions.EVENT,
				payload: <IEvent>{
					path: "this-path",
					event,
					arg: payload
				},
			})
		}
	}

	protected onChangeState(old: any): void {
		super.onChangeState(old)
		this.emit("state:change", this._state)
	}
}