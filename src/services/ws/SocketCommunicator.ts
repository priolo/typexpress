import { ServiceBase } from "../../core/service/ServiceBase.js"
import { IClient, SocketLog, SocketRouteActions } from "./utils.js"



export type SocketCommunicatorConf = Partial<SocketCommunicator['stateDefault']>

/**
 * Nodo astratto che puo' essere messo in gerarchia e riceve gli eventi dai parent
 */
export abstract class SocketCommunicator extends ServiceBase {

	// get stateDefault() {
	// 	return {
	// 		...super.stateDefault,
	// 		onConnect: <(this: SocketCommunicator, client: IClient) => void>null,
	// 		onDisconnect: <(this: SocketCommunicator, client: IClient) => void>null,
	// 		onMessage: <(this: SocketCommunicator, client: IClient, message: string) => void>null,
	// 	}
	// }

	get executablesMap() {
		return {
			...super.executablesMap,

			[SocketRouteActions.SEND]: (payload: { client: IClient, message: any }) =>
				this.sendToClient(payload.client, payload.message),
			[SocketRouteActions.BROADCAST]: (message: any) =>
				this.sendToAll(message),
			[SocketRouteActions.DISCONNECT]: (client: IClient) =>
				this.disconnectClient(client),
		}
	}

	/**
	 * c'e' una NUOVA connessione da un client
	 */
	onConnect(client: IClient): void {
		if (!client) return
		//this.state.onConnect?.bind(this)(client)
		for (const node of this.children) {
			(<SocketCommunicator>node)?.onConnect?.(client)
		}
		//this.emitter.emit("open", { client })
		this.log( SocketLog.OPEN, { client })
	}

	/**
	 * un client si disconnette
	 */
	onDisconnect(client: IClient) {
		if (!client) return
		//this.state.onDisconnect?.bind(this)(client)
		for (const node of this.children) {
			(<SocketCommunicator>node)?.onDisconnect?.(client)
		}
		//this.emitter.emit("close", { client })
		this.log(SocketLog.CLOSE, { client })
	}

	/**
	 * Richiamato quando c'e' un MESSAGE dal CLIENT
	 */
	onMessage(client: IClient, message: string) {
		if (!client || !message) return
		//this.state.onMessage?.bind(this)(client, message)
		for (const node of this.children) {
			(<SocketCommunicator>node)?.onMessage?.(client, message)
		}
		//this.emitter.emit("message", { client, message })
		this.log(SocketLog.MESSAGE, { client, message })
	}

	/**
	 * Invia un MESSAGE ad un CLIENT
	 */
	sendToClient(client: IClient, message: any) {
		if (!client || !message) return
		if (!(this.parent instanceof SocketCommunicator)) return
		this.parent.sendToClient(client, message)
	}

	/**
	 * Invia un MESSAGE a tutti i CLIENT
	 */
	sendToAll(message: any) {
		const clients = this.getClients()
		clients.forEach(client => this.sendToClient(client, message))
	}

	/**
	 * Invia un segnale di PING al CLIENT e attende la risposta
	 */
	async sendPing(client: IClient, timeout: number): Promise<number> {
		if (!(this.parent instanceof SocketCommunicator)) return
		return await this.parent.sendPing(client, timeout)
	}

	/**
	 * Chiude la connessione ad un CLIENT 
	 */
	disconnectClient(client: IClient) {
		if (!(this.parent instanceof SocketCommunicator)) return
		this.parent.disconnectClient(client)
	}

	/**
	 * Restituisce tutti i CLIENT connessi
	 */
	getClients(): IClient[] {
		if (!(this.parent instanceof SocketCommunicator)) return []
		return this.parent.getClients()
	}
}