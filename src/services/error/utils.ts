

export enum Actions {
	/** 
	 * si tratta di una notifica che è avvenuto un errore 
	 * payload(:Error)
	 * */
	NOTIFY = "notify"
}

/** messaggio di errore  */
export interface Error {
	code:string,
	error?: any,
}