
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
