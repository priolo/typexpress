import { ServiceBase } from "../../core/ServiceBase"
import { HttpService } from "../http/HttpService"
import { JWTActions } from "../jwt/JWTRepoService"
import { Bus } from "../../core/path/Bus"

import { Request } from "express"
import WebSocket from "ws"
import url, { URLSearchParams } from 'url'



class SocketRouteService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-route",
			path: null,
			onConnect: null,
			onDisconnect: null,
			onMessage: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[SocketServerActions.SEND]: (state, payload) => {
				const { client, message } = payload
				this.sendToClient(client, message)
			},
		}
	}

	protected onConnect ( client:Client ) {

	}

	protected onDisconnect ( client:Client ) {

	}

	protected onMessage ( client:Client, message:any ) {

	}
	

	

	/**
	 * Invia un oggetto JSON ad un CLIENT-JSON
	 * @param client è un client JSON (da non confondere con un ws-client)
	 * @param message payload JSON 
	 */
	private sendToClient(client: Client, message: any) {
		const cws: WebSocket = this.findCWSByClient(client)
		try {
			cws.send(message)
		} catch (error) {
			// [II] gestire errore
			throw error
		}
	}

	




	/**
	 * Restituisce un CLIENT-WEB-SOCKET tramite CLIENT-JSON
	 * @param client 
	 * @returns 
	 */
	private findCWSByClient(client: Client) {
		const iter = this.server.clients as Set<any>
		for (const cws of iter) {
			const socket = cws._socket
			if (clientIsEqual(socket, client)) {
				return cws
			}
		}
		return null
	}

	/**
	 * Restituisce un CLIENT-JSON tramite CLIENT-WEB-SOCKET
	 * @param cws 
	 * @returns 
	 */
	private findClientByCWS(cws: WebSocket) {
		const { clients } = this.state
		const socket = (cws as any)._socket
		const client = clients.find(client => clientIsEqual(client, socket))
		return client
	}

	


	private updateClients() {
		const clients: Array<Client> = [...this.server.clients].map((cws: WebSocket) => {
			const socket = (cws as any)._socket
			return {
				remoteAddress: socket.remoteAddress,
				remotePort: socket.remotePort
			}
		})
		this.setState({ clients })
	}

	private addClient(client: Client) {
		const { clients } = this.state
		clients.push(client)
		this.setState({ clients })
	}

	private removeClient(client: Client) {
		const { clients } = this.state
		const clientsnew = clients.filter(c => !clientIsEqual(client, c))
		this.setState({ clients: clientsnew })
	}

}

export default SocketRouteService

interface Client {
	remoteAddress: string,
	remotePort: number,
}


export enum SocketServerActions {
	/**
	 * Invia una STRINGA ad un CLIENT   
	 * payload= `{ client:Client, message: JSON.stringify(obj) }`
	 */
	SEND = "ws:send",
	/**
	 * Disconnette un CLIENT  
	 * payload= `{ client:Client }`
	 */
	DISCONNECT = "ws:disconnect",
}