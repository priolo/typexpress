
export interface IClient {
	remoteAddress: string,
	remotePort: number,
}

export interface IMessage {
	path: string,
	action?: string,
	payload?: any,
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

export function clientIsEqual(client: IClient, ws: IClient): boolean {
	return client.remoteAddress == ws.remoteAddress && client.remotePort == ws.remotePort
}
