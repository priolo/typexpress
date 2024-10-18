

// *** SERVER ***


export interface ServerObject {
	idObj: string
	value: any[]
	listeners: Listener[]
	actions: Action[]
}

export interface Listener {
	client: any
	lastVersion: number
}

export interface Action {
	/** qaulsiasi comando che permetta l'aggiornamento */
	command: any
	atVersion: number
	version: number
}

// MESSAGES
export interface ServerInitMessage {
	type: "s:init"
	idObj: string
	data: any[]
	version: number
}

export interface ServerUpdateMessage {
	type: "s:update"
	idObj: string
	actions: Action[]
	//version: number
}


// *** CLIENT ******************************************

// DATA

export interface ClientObject {
	idObj: string
	value: any[]
	version: number
	buffer: Action[]
}

// MESSAGES

/**
 * dice al server che il client vuole ricevere e osservare un OBJECT
 */
export interface ClientInitMessage {
	type: "c:init"
	payload: {
		idObj: string
	}
}

/** 
 * dice al server a quale versione il client è arrivato su tutti gli OBJECTs osservati 
 * Serve quando il client si disconnette e si riconnette
 * */
export interface ClientResetMessage {
	type: "c:reset"
	payload: {
		idObj: string,
		version: number,
	}[]
}

/** 
 * dice al server che il client ha eseguito un comando di aggiornamento su un OBJECT osservato
 * */
export interface ClientUpdateMessage {
	type: "c:update"
	payload: {
		idObj: string, // id dell'Obj
		atVersion: number,
		commands: any[],
	}
}

export type ClientMessage = ClientInitMessage | ClientUpdateMessage | ClientResetMessage

export type ApplyActionFunction = (data?: any[], action?: Action) => any[];