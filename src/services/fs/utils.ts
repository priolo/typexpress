/**
 * ACTION per la gestione del FILE SYSTEM
 * fanno tutte riferimento alla "baseDir" 
 */
export enum Actions {

	/** 
	 * lista della directory 
	 * payload(:string) path directory
	*/
	LIST = "list",
	
	/** 
	 * crea una nuova directory 
	 * payload(:string) 
	 * */
	NEW_DIR = "newDir",

	MOVE = "move",
	RENAME = "rename",
	DELETE = "delete",
	NEW_TEXT = "newText",
	GET_TEXT = "getText",
}

export interface FsItem {
	name: string,
	type: FsType,
	parent: string,
}

export enum FsType {
	FILE = 0, DIR
}