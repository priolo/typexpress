
export enum RepoStructActions {
	/** permette di specificare un array di action dirette al repository */
	SEED = "seed",
	/** cancella i dati di una tabella disattivando le foregn keys */
	TRUNCATE = "truncate",
	/** cancella i dati di una tabella */
	CLEAR = "clear",
}