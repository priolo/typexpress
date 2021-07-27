import { IMessage, SocketRouteActions, IClient } from "./utils"
import { ServiceBase } from "../../core/service/ServiceBase"



export abstract class SocketCommunicator extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			path: null,
			onConnect: null,
			onDisconnect: null,
			onMessage: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,

			[SocketRouteActions.SEND]: (state, payload) => {
				const { client, message } = payload
				this.sendToClient(client, message)
			},
			[SocketRouteActions.BROADCAST]: (state, message) => {
				this.sendToAll(message)
			},
			[SocketRouteActions.DISCONNECT]: (state, client) => {
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
		const { onConnect } = this.state
		if (onConnect) onConnect.bind(this)(client)

		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onConnect(client)
		})
	}

	onDisconnect(client: IClient) {
		const { onDisconnect } = this.state
		if (onDisconnect) onDisconnect.bind(this)(client)

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
	// NON VA BENE! la path nel message non deve cambiare... utilizzare un paroprietà di appoggio
	onMessage(client: IClient, message: string | IMessage) {
		const { onMessage, path } = this.state

		// si tratta di un messaggio con "path" <IMessage>
		if (path && message && typeof message != "string") {

			const msg: IMessage = message
			const paths = msg.path?.split("/")

			// c'e' corrispondenza richiamo l'evento
			if (!paths || paths.length == 0 || (paths.length == 1 && paths[0] == path)) {
				onMessage?.bind(this)(client, message)
				return

				// non c'e' corrispondenza ma il primo path corrisponde... devo andare in profondità!
			} else if (paths[0] == path) {
				message = { ...message, path: paths.slice(1).join("/") }

			} else {
				return
			}
			// è una semplice stringa non la mando nei ROUTE
			// } else if (typeof message=="string") {
			// 	onMessage?.bind(this)(client, message)
			// 	return
			// }

		// è un altro tipo di messaggio...
		} else {
			onMessage?.bind(this)(client, message)
		}

		// mando il messaggio nei CHILDREN
		const routes = this.children as SocketCommunicator[]
		for (const route of routes) {
			route.onMessage(client, message)
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