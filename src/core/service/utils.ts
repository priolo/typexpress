
/**
 * le coordibnate di un nodo che si puo' registrare ad un evento
 */
export interface IListener {
	/** path del NODE-DESTINATION che si registra all'EVENT */
	path: string,
	/** EVENT-NAME a cui si registra */
	event: string
}

/**
 *  Oggetto mandato al LISTENER quando c'e' un EVENT
 * */
export interface IEvent {
	/** NODE-TARGET dove è stato creato l'evento */
	source: string,
	/** EVENT-NAME dell'evento avvenuto*/
	name: string,
	/** dati specifici dell'EVENT*/
	arg?: any,
}

/**
 * ACTIONS che si possono fare ad un oggetto "ServiceBase"
 */
export enum ServiceBaseActions {
	REGISTER = "event:register",
	UNREGISTER = "event:unregister",
	EVENT = "event:arrived",
}

/**
 * EVENT-NAME che si possono ascoltare di un oggetto "ServiceBase"
 */
export enum ServiceBaseEvents {
	STATE_CHANGE = "state:change",
	INIT = "node:init",
	INIT_AFTER = "node:init-after",
	DESTROY = "node:destroy",
	DISPATCH = "node:dispatch"
}