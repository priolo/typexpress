import { IMessage, SocketServerActions, IClient } from "./utils"
import { ServiceBase } from "../../core/ServiceBase"



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

			[SocketServerActions.SEND]: (state, payload) => {
				const { client, message } = payload
				this.sendToClient(client, message)
			},
			[SocketServerActions.BROADCAST]: (state, message) => {
				this.sendToAll(message)
			},
			[SocketServerActions.DISCONNECT]: (state, client) => {
				this.disconnectClient(client)
			},
		}
	}

	onConnect(client: IClient, jwtPayload: any) {
		const { onConnect } = this.state
		if (onConnect) onConnect.bind(this)(client, jwtPayload)

		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onConnect(client, jwtPayload)
		})
	}
	/**
	 * Richiamato quando c'e' un messaggio dal CLIENT
	 * @param client Il CLIENT che mi manda il MESSAGE
	 * @param message Dovrebbe essere sempre una stringa
	 * @param jwtPayload PAYLOAD-JWT se è stato definito
	 * @returns 
	 */
	onMessage(client: IClient, message: string | IMessage, jwtPayload: any) {
		const { onMessage } = this.state
		if (onMessage) onMessage.bind(this)(client, message, jwtPayload)

		let messageJson: IMessage = null
		const routes = this.children as SocketCommunicator[]
		for (const route of routes) {
			const { path } = route.state
			if (path && !messageJson) {
				messageJson = typeof message == "string" ? JSON.parse(message) : message
			}
			if (!path) {
				route.onMessage(client, message, jwtPayload)
			} else if (messageJson?.path == path) {
				route.onMessage(client, messageJson, jwtPayload)
			}
		}
	}

	onDisconnect(client: IClient) {
		const { onDisconnect } = this.state
		if (onDisconnect) onDisconnect.bind(this)(client)

		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onDisconnect(client)
		})
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
		if (!(this.parent instanceof SocketCommunicator)) return
		this.parent.sendToAll(message)
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
		this.parent.getClients()
	}
}