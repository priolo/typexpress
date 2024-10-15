

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
	version: number
}


// *** CLIENT ******************************************

// DATA

export interface ClientObject {
	idObj: string
	value: any[]
	version: number
}

// MESSAGES
export interface ClientInitMessage {
	type: "c:init"
	payload: {
		idObj: string
	}
}

export interface ClientUpdateMessage {
	type: "c:update"
	payload: {
		idObj: string, // id dell'Obj
		atVersion: number,
		command: any,
	}
}



export type ApplyActionFunction = (data: any[], action: Action) => any[];