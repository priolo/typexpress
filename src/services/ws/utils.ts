
export interface IClient {
	remoteAddress: string,
	remotePort: number,
	/**
	 * Sono i parametri ricavati dall'URL durante la connessione
	 */
	params?: any,
	/**
	 * PAYLOAD-JWT se è stato definito
	 */
	jwtPayload?: any,
}

export interface IMessage {
	path: string,
	action?: string, 	// non serve
	payload?: any,		// non serve
}

export enum SocketServerActions {
	/**
	 * Fa partire il server WEBSOCKET  
	 * se `autostart` è `true` parte in automatico
	 */
	START = "ws:start",
	/**
	 * Ferma e libera le risorse del server WEBSOCKET
	 */
	STOP = "ws:stop",
}

export enum SocketRouteActions {
	/**
	 * Invia una STRINGA ad un CLIENT   
	 * payload= `{ client:Client, message: JSON.stringify(obj) }`
	 */
	SEND = "ws:send",
	/**
	 * Invia un messaggio a tutti i client connessi
	 */
	BROADCAST = "ws:broadcast",
	/**
	 * Disconnette un CLIENT  
	 * payload= `{ client:Client }`
	 */
	DISCONNECT = "ws:disconnect",
}

/**
 * Gli errori gestiti da questo servizio
 */
export enum Errors {
	BROADCAST = "ws:broadcast",
}

export function clientIsEqual(client: IClient, ws: IClient): boolean {
	return client.remoteAddress == ws.remoteAddress && client.remotePort == ws.remotePort
}
