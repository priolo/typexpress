
export interface IListener {
	path: string,
	event: string
}

export interface IEvent {
	source: string,	// NODE dove è stato creato l'evento
	name: string,	// nome dell'evento
	arg?: any,		// payload
}

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
	DISPATCH = "node:dispatch"
}

export { ServiceBase } from "./ServiceBase"