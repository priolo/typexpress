
/**
 * Definisce una ACTION da spedire ad un NODE
 */
 export interface IAction {
	/** tipo di ACTION da eseguire */
	type: string
	payload?: any,		// gli argomenti che servono all'ACTION
	sender?: string,	// il NODE che ha inviato l'ACTION. Potrebbe non esserci o essere valorizzato dal sistema
	wait?: number,		// se presente è il tempo che bisogna asettare prima di rinunciare a inviare il messaggio
	sendTime?: number,	// inserito dal sistema indica quando è stato spedito il messaggio
}

/**
 * Definisce la struttura ad albero dei Node
 */
 export interface INode {
	
	id:string

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