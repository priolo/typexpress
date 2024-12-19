
/**
 * le coordinate di un nodo che si puo' registrare ad un evento
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
	/** mi registro ad un evento */
	REGISTER = "event:register",
	/** mi cancello da un evento */
	UNREGISTER = "event:unregister",
	/** l'arrivo di un evento */
	EVENT = "event:arrived",
}

/**
 * EVENT-NAME che si possono ascoltare di un oggetto "ServiceBase"
 */
export enum ServiceBaseEvents {
	/** quando lo STATE del NODE cambia */
	STATE_CHANGE = "state:change",
	/** quando il NODE è inizializzato */
	INIT = "node:init",
	INIT_AFTER = "node:init-after",
	DESTROY = "node:destroy",
	DISPATCH = "node:dispatch"
}

/**
 * Gli errori gestiti da questo servizio
 */
export enum Errors {
	INIT = "base:init"
}