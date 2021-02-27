
export interface Action {
	type: string		// tipo di ACTION da eseguire
	payload?: any,		// gli argomenti che servono all'ACTION
	sender?: string,	// il NODE che ha inviato l'ACTION. Potrebbe non esserci o essere valorizzato dal sistema
	wait?: number,		// se presente è il tempo che bisogna asettare prima di rinunciare a inviare il messaggio
	sendTime?: number,	// inserito dal sistema indica quando è stato spedito il messaggio
}