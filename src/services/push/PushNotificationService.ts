import { ServiceBase } from "../../core/ServiceBase"
import nodemailer, { Transporter } from "nodemailer"
import emailCheck from "email-check"
import WebSocket from "ws"



export enum SocketServerActions {
	START = "ws:start",
	STOP = "ws:stop",
	SEND = "ws:send",
	DISCONNECT = "ws:disconnect",
}


class PushNotificationService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "push",
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[SocketServerActions.START]: async (state) => {
				await this.startListener()
			},
			[SocketServerActions.STOP]: async (state) => {
				await this.stopListener()
			},
			[SocketServerActions.SEND]: (state, payload) => {
				const { client, data } = payload
				this.sendToClient(client, data)
			},
			[SocketServerActions.DISCONNECT]: (state, client) => {
				this.disconnectClient(client)
			},
		}
	}

	private server: WebSocket.Server = null

	protected async onInit() {
		super.onInit()
		const { autostart } = this.state
		if (!autostart) return
		await this.startListener()

	}

	protected async onDestroy() {
		super.onDestroy()
		this.stopListener()

	}



	private async startListener() {
		if (this.server) return
		const { port } = this.state
		let resolve
		const promise = new Promise((res,rej)=>resolve=res)

		// se non c'e la porta allora agganciati al servizio htt superiore
		// TODO

		this.server = new WebSocket.Server(
			{ port },
			() => {
				resolve() 
				console.log("server:callback") 
			}
		)
		await this.buildEventsServer()

		return promise
	}

	private async stopListener() {
		if (!this.server) return
		this.server.close()
		this.server = null
	}

	private sendToClient(client, data) {
		const cws:WebSocket = this.findCWSByClient(client)
		cws.send(data)
	}

	private disconnectClient(client) {
		const cws:WebSocket = this.findCWSByClient(client)
		cws.close()
		
	}





	private findCWSByClient(client:Client) {
		const iter = this.server.clients as Set<any>
		for (const cws of iter) {
			const socket = cws._socket
			if (clientIsEqual(socket, client)) {
				return cws
			}
		}
		return null
	}
	private findClientByCWS(cws:WebSocket) {
		const { clients } = this.state
		const socket = (cws as any)._socket
		const client = clients.find(client => clientIsEqual(client, socket))
		return client
	}







	private async buildEventsServer() {

		this.server.on('connection', (cws, req) => {
			const { onConnect } = this.state
			const client = {
				remoteAddress: req.connection.remoteAddress,
				remotePort: req.connection.remotePort
			}
			if (onConnect) onConnect.bind(this)(client)
			this.addClient(client)
			this.buildEventsClient(cws)
		})

		this.server.on("error", (error) => {
			console.log("server:error:")
			console.log(error)
			console.log("---")
		})

		this.server.on("close", (cws) => {
			console.log("server:close:")
			const client = this.findClientByCWS(cws)
			this.removeClient(client)
		})
	}

	private buildEventsClient(cws) {
		const { onMessage } = this.state
		cws.on('message', data => {
			const client = this.findClientByCWS(cws)
			if (onMessage) onMessage.bind(this)(client, data)
		})
	}

	private addClient(client) {
		const { clients } = this.state
		clients.push(client)
		this.setState({ clients })
	}

	private removeClient(client:Client) {
		const { clients } = this.state
		const clientsnew = clients.filter(c => !clientIsEqual(client, c))
		this.setState({ clients: clientsnew })
	}

}

export default PushNotificationService

interface Client {
	remoteAddress: string,
	remotePort: number,
}

function clientIsEqual(client:Client, ws:Client): boolean {
	return client.remoteAddress == ws.remoteAddress && client.remotePort == ws.remotePort
}