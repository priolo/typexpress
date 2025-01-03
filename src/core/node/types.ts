import { NodeState } from "./NodeState.js"

/**
 * ./NodeConf ACTIONS
 */
export enum ConfActions {
	/** genera tutta la struttura dei NODES da una `payload` di configurazione */
	INIT = "init",
	/** Distrugge il NODE chiamando anche gli opportuni metodi */
	DESTROY = "destroy",
}
/**
 * Definisce una ACTION da spedire ad un NODE
 */
export interface IAction {
	/**
	 * tipo di ACTION da eseguire.
	 * praticamente è il nome della funzione da eseguire
	 * */
	type: string
	/**
	 * gli argomenti che servono all'ACTION
	 * possono essere qualsiasi cosa
	 * */
	payload?: any
	/**
	 * la path del NODE che ha inviato l'ACTION.
	 * Potrebbe non esserci (null) o essere valorizzato dal sistema
	 * */
	sender?: string
	/**
	 * se presente è il tempo che bisogna asettare prima di rinunciare a inviare il messaggio
	 * questo succede se per esempio un NODE non è raggiungibile o deve essere ancora creato
	 */
	wait?: number
	/**
	 * [UTC] inserito dal sistema. Indica quando è stato spedito il messaggio
	 */
	sendTime?: number
	/**
	 * cosa fare se c'e' un errore
	 * [II] questa è ridondante ripetto a "wait"
	 */
	error?: {
		/** numero di tentativi di ripetere l'action */
		reattempt: number
		/** millisecondi di attesa tra un tentativo e l'altro */
		wait: number
	}
}

export enum TypeLog {
	/** log di debug */
	DEBUG = "debug",
	/** log di informazione */
	INFO = "info",
	/** log di avviso */
	WARN = "warn",
	/** log di errore */
	ERROR = "error",
	/** log di errore grave */
	FATAL = "fatal",
}
/**
 *  Oggetto mandato al LISTENER quando c'e' un EVENT
 * */

export interface ILog {
	/** NODE-TARGET dove è stato creato l'evento */
	source: string;
	/** NODE deove è stato creato l'evento */
	target?: NodeState;
	/** EVENT-NAME dell'evento avvenuto*/
	name: string;
	/** dati specifici dell'EVENT*/
	payload?: any;
	/** tipo di log */
	type?: TypeLog;
}/**
 * EVENT-NAME che si possono ascoltare di un oggetto "ServiceBase"
 */
export enum EventsLogsBase {
	/** quando lo STATE del NODE cambia */
	STATE_CHANGE = "state:change",
	/** quando il NODE è inizializzato */
	NODE_INIT = "node:init",
	NODE_INIT_AFTER = "node:init-after",
	NODE_DESTROY = "node:destroy",
	NODE_EXECUTE = "node:execute",

	ERR_EXECUTE = "err:execute",
	ERR_INIT = "err:init",
	ERR_BUILD_CHILDREN = "err:build:children",
}

