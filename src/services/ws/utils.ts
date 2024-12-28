import net from "net"
import url, { URLSearchParams } from 'url'
import { Request } from "express"



/**
 * Rappresenta un client connesso al server WEBSOCKET
 * le connessioni reali al websocket sono in un altro array
 * per dividere i dati del client da quelli del websocket
 */
export interface IClient {
	remoteAddress: string,
	remotePort: number,
	/** parametri ricavati dall'URL durante la connessione	*/
	params?: any,
	/** PAYLOAD-JWT se è stato definito	*/
	jwtPayload?: any,
}

// export interface IMessage {
// 	/** la path dove è stato intercettato il messagio oppure a quale route è diretto */
// 	path: string,
// 	/** [non usato] campo libero del client*/
// 	action?: string,
// 	/** dati inviati dal client */
// 	payload?: any,
// }

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

export enum SocketLog {
	/**
	 * un client si è connesso
	 */
	OPEN = "ws:open",
	/**
	 * un client si è disconnesso
	 */
	CLOSE = "ws:close",
	/**
	 * un client ha inviato un messaggio
	 */
	MESSAGE = "ws:message",
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

/**
 * Restituisce una porta random libera
 */
export async function getFreePort(): Promise<number> {
	return new Promise(res => {
		const srv = net.createServer();
		srv.listen(0, () => {
			const port = (<net.AddressInfo>srv.address()).port
			srv.close((err) => res(port))
		});
	})
}

/** 
 * restituisce i parametri QUERY-STRING presenti nella request 
 * */
export function getUrlParams(request: Request): any {
	const index = request.url.lastIndexOf("?")
	const querystring = (index == -1 ? url : request.url.slice(index)) as string
	const params = new URLSearchParams(querystring)
	return Object.fromEntries(params)
}
