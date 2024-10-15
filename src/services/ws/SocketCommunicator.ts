import { ServiceBase } from "../../core/service/ServiceBase"
import { IClient, IMessage, SocketRouteActions } from "./utils"



export type SocketCommunicatorConf = Partial<SocketCommunicator['stateDefault']>

export abstract class SocketCommunicator extends ServiceBase {

	get stateDefault() {
		return {
			...super.stateDefault,
			path: <string>null,
			onConnect: <(this: SocketCommunicator, client: IClient) => void>null,
			onDisconnect: <(this: SocketCommunicator, client: IClient) => void>null,
			onMessage: <(this: SocketCommunicator, client: IClient, message: string | IMessage) => void>null,
		}
	}

	get dispatchMap() {
		return {
			...super.dispatchMap,

			[SocketRouteActions.SEND]: (state, payload: { client: IClient, message: any }) => {
				const { client, message } = payload
				this.sendToClient(client, message)
			},
			[SocketRouteActions.BROADCAST]: (state, message: any) => {
				this.sendToAll(message)
			},
			[SocketRouteActions.DISCONNECT]: (state, client: IClient) => {
				this.disconnectClient(client)
			},
		}
	}

	/**
	 * Chiamato quando c'e' una NUOVA connessione da un client
	 * @param client 
	 * @param jwtPayload 
	 */
	onConnect(client: IClient): void {
		this.state.onConnect?.bind(this)(client)
		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onConnect(client)
		})
	}

	onDisconnect(client: IClient) {
		this.state.onDisconnect?.bind(this)(client)
		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onDisconnect(client)
		})
	}

	/**
	 * Richiamato quando c'e' un messaggio dal CLIENT
	 * @param client Il CLIENT che mi manda il MESSAGE
	 * @param message Dovrebbe essere sempre una stringa
	 * @returns 
	 */
	onMessage(client: IClient, message: string | IMessage, paths: string[] = null) {
		let { path } = this.state

		if (!message) return
		if (!path) path = ""
		if (path.startsWith("/")) path = path.slice(1)

		// se il messaggio non ha paths allora manda a tutti
		if (paths == null) {
			this.state.onMessage?.bind(this)(client, message)

			// se c'e' la corrispondenza con questo NODO 
			// mandalo a questo e finisci
		} else if ((paths.length == 1 && paths[0] == path) || (paths.length == 0 && path.length == 0)) {
			this.state.onMessage?.bind(this)(client, message)
			return

			// non c'e' corrispondenza ma il primo path corrisponde... mando ai child
		} else if (paths[0] == path) {
			paths.splice(0, 1)

		} else if (path.length == 0) {

			// non c'e' corrispondenza quindi fuori dal ramo
		} else {
			return
		}

		// mando il messaggio nei CHILDREN
		const routes = this.children as SocketCommunicator[]
		for (const route of routes) {
			route.onMessage(client, message, paths)
		}
	}

	/**
	 * Invia un oggetto JSON ad un CLIENT-JSON
	 * @param client è un client JSON (da non confondere con un ws-client)
	 * @param message payload JSON 
	 */
	sendToClient(client: IClient, message: any) {
		if (!(this.parent instanceof SocketCommunicator)) return
		this.parent.sendToClient(client, message)
	}

	/**
	 * Invia un MESSAGE a tutti i client di questo ROUTE
	 * @param message 
	 */
	sendToAll(message: any) {
		const clients = this.getClients()
		clients.forEach(client => this.sendToClient(client, message))
	}

	async sendPing(client: IClient, timeout: number): Promise<number> {
		if (!(this.parent instanceof SocketCommunicator)) return
		return await this.parent.sendPing(client, timeout)
	}


	/**
	 * Chiudi la connessione ad un CLIENT-JSON 
	 * @param client client JSON
	 */
	disconnectClient(client: IClient) {
		if (!(this.parent instanceof SocketCommunicator)) return
		this.parent.disconnectClient(client)
	}

	getClients(): IClient[] {
		if (!(this.parent instanceof SocketCommunicator)) return
		return this.parent.getClients()
	}
}