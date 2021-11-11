
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
	 * il NODE che ha inviato l'ACTION. Potrebbe non esserci o essere valorizzato dal sistema 
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


/**
 * Definisce la struttura ad albero dei Node
 */
 export interface INode {
	/**
	 * random identifier of the node
	 */
	id:string
	/**
	 * node name. It is also used by the pathfiend
	 */
	name:string

	parent:INode | null

	readonly children:INode[]

	addChild(child: INode): void

	removeChild(child: INode): void

	indexChild(child: INode): number
	
}

//[II]
export enum ConfActions {
	START = "start", 	// sostituire con "CREATE" (with config)
	STOP = "stop"		// sostituire con "DESTROY"
	// START
	// STOP
	// CHILD_ADD
}