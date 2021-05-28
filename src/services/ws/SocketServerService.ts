import { ServiceBase } from "../../core/ServiceBase"
import { HttpService } from "../http/HttpService"
import { JWTActions } from "../jwt/JWTRepoService"
import { Bus } from "../../core/path/Bus"

import { Request } from "express"
import WebSocket from "ws"
import url, { URLSearchParams } from 'url'



class SocketServerService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-server",
			autostart: true,
			path: null,
			port: null,
			jwt: null,
			clients: [],
			onConnect: null,
			onDisconnect: null,
			onMessage: null,
			onAuth: null,
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
				const { client, message } = payload
				this.sendToClient(client, message)
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


	/**
	 * Inizializza il server in base a come è impostato il config (come al solito inzomma)
	 * @returns 
	 */
	private async startListener() {
		if (this.server) return
		const { port } = this.state

		if (port) {
			await this.buildServer()
		} else {
			this.attachToServerHttp()
		}
		await this.buildEventsServer()
	}

	/**
	 * Costruisce un SERVER-WEB-SOCKET senza bisogno di un SERVER-HTTP 
	 * @returns 
	 */
	private async buildServer(): Promise<void> {
		const { port } = this.state
		let resolve, reject
		const promise = new Promise<void>((res, rej) => { resolve = res; reject = rej })
		if (!port) reject("no port")
		this.server = new WebSocket.Server({ port }, () => { resolve() })
		return promise
	}

	/**
	 * Attacca il SERVER-WEB-SOCKET al SERVER-HTTP superiore
	 */
	private attachToServerHttp() {
		const parentHttp = this.parent instanceof HttpService ? this.parent.testServer : null
		if (!parentHttp) throw new Error("non c'e' il server http")

		this.server = new WebSocket.Server({ noServer: true })
		parentHttp.on('upgrade', this.onUpgrade)
	}
	private detachToServerHttp() {
		const parentHttp = this.parent instanceof HttpService ? this.parent.testServer : null
		if (!parentHttp) return
		parentHttp.off('upgrade', this.onUpgrade)
	}
	private onUpgrade = async (request, socket, head) => {
		const { path, jwt, onAuth } = this.state
		let jwtPayload

		// controllo che il path sia giusto
		const wsUrl = url.parse(request.url)
		if (path && wsUrl.pathname != path) return

		// controllo se c'e' un autentificazione da fare
		if (jwt) {
			const index = request.url.lastIndexOf("?")
			const querystring = index == -1 ? url : request.url.slice(index)
			const params = new URLSearchParams(querystring)
			const token = params.get("token")
			let response = false
			if (token) {
				jwtPayload = await new Bus(this, jwt)
					.dispatch({ type: JWTActions.DECODE, payload: token })
				response = onAuth ? onAuth.bind(this)(jwtPayload) : true
			}
			if (!response) {
				socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
				socket.destroy()
				return
			}
		}

		// gestisce la connessione col client			
		this.server.handleUpgrade(request, socket, head, (ws) => {
			this.server.emit('connection', ws, request, jwtPayload);
		})
	}


	/** Fine della storia */
	private async stopListener() {
		if (!this.server) return
		this.server.close()
		this.detachToServerHttp()
		this.server = null
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
	 * Chiudi la connessione ad un CLIENT-JSON 
	 * @param client client JSON
	 */
	private disconnectClient(client) {
		const cws: WebSocket = this.findCWSByClient(client)
		cws.close()
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

	/**
	 * Si mette in ascolto sugli eventi del SERVER-WEB-SOCKET
	 */
	private async buildEventsServer() {

		this.server.on('connection', (cws: WebSocket, req: Request, jwtPayload: any) => {
			const { onConnect } = this.state
			const client = {
				remoteAddress: req.connection.remoteAddress,
				remotePort: req.connection.remotePort
			}
			if (onConnect) onConnect.bind(this)(client)
			this.addClient(client)
			this.buildEventsClient(cws, jwtPayload)
		})

		this.server.on("error", (error) => {
			console.log("server:error:")
			console.log(error)
			console.log("---")
		})

		this.server.on("close", (cws: WebSocket) => {
			console.log("server:close:")
			const client = this.findClientByCWS(cws)
			this.removeClient(client)
		})
	}

	/**
	 * Si mette in ascolto sugli eventi del CLIENT-WEB-SOCKET arrivato al server
	 * @param cws CLIENT-WEB-SOCKET
	 * @param jwtPayload il JWT-PAYLOAD della connessione JWT-TOKEN
	 */
	private buildEventsClient(cws: WebSocket, jwtPayload: any) {
		const { onMessage } = this.state
		cws.on('message', (message: string) => {
			const client = this.findClientByCWS(cws)
			if (onMessage) onMessage.bind(this)(client, message, jwtPayload)
		})
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

export default SocketServerService

interface Client {
	remoteAddress: string,
	remotePort: number,
}

function clientIsEqual(client: Client, ws: Client): boolean {
	return client.remoteAddress == ws.remoteAddress && client.remotePort == ws.remotePort
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