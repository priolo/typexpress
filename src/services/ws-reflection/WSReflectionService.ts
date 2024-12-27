import { ServiceBase } from "../../core/service/ServiceBase.js"
import emailCheck from "email-check"
import nodemailer, { Transporter } from "nodemailer"
import { Actions, IAccount, IEmail } from "./utils.js"
import { SocketCommunicator } from "../ws/SocketCommunicator.js"
import { IClient } from "../ws/utils.js"



export type WSReflectionConf = Partial<WSReflectionService['stateDefault']>

/**
 * 
 */
export default class WSReflectionService extends SocketCommunicator {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "ws-reflection",
		}
	}

	get executablesMap(): any {
		return {
			...super.executablesMap,

			[Actions.CREATE_TEST_ACCOUNT]: async () => {
				const account = await nodemailer.createTestAccount()
				this.setState({ account })
			},

			[Actions.CREATE_ACCOUNT]: (account: IAccount) => {
				this.setState({ account })
			},
			[Actions.SEND]: async (email: IEmail) => {
				await this.transporter.sendMail(email)
			},
			[Actions.CHECK]: async (address: string) => {
				let res = false
				try {
					res = await emailCheck(address)
				} catch (err: any) {
					if (err.message === 'refuse') {
						// The MX server is refusing requests from your IP address.
					} else {
						// Decide what to do with other errors.
					}
				}
				return res
			},
		}
	}


	/**
	 * c'e' una NUOVA connessione da un client
	 */
	onConnect(client: IClient): void {
		if (!client) return
		this.state.onConnect?.bind(this)(client)
		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onConnect(client)
		})
		this.emitter.emit("open", { client })
	}

	/**
	 * un client si disconnette
	 */
	onDisconnect(client: IClient) {
		if (!client) return
		this.state.onDisconnect?.bind(this)(client)
		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onDisconnect(client)
		})
		this.emitter.emit("close", { client })
	}

	/**
	 * Richiamato quando c'e' un MESSAGE dal CLIENT
	 */
	onMessage(client: IClient, message: string) {
		if (!client || !message) return
		this.state.onMessage?.bind(this)(client, message)
		this.children.forEach(node => {
			if (node instanceof SocketCommunicator) node.onMessage(client, message)
		})
		this.emitter.emit("message", { client, message })
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
