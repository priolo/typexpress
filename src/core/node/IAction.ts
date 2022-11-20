
/**
 * Definisce una ACTION da spedire ad un NODE
 */
 export interface IAction {
	/** 
	 * tipo di ACTION da eseguire 
	 * */
	type: string
	/** 
	 * gli argomenti che servono all'ACTION 
	 * */
	payload?: any,
	/** 
	 * la path del NODE che ha inviato l'ACTION. Potrebbe non esserci o essere valorizzato dal sistema 
	 * */
	sender?: string,
	/**
	 * se presente è il tempo che bisogna asettare prima di rinunciare a inviare il messaggio
	 */
	wait?: number,
	/**
	 * inserito dal sistema indica quando è stato spedito il messaggio
	 */
	sendTime?: number,
	/**
	 * direttive se c'e' un errore
	 */
	error?: {
		/** numero di tentativi di ripetere l'action */
		reattempt: number,
		/** millisecondi di attesa tra un tentativo e l'altro */
		wait: number,
	}
}