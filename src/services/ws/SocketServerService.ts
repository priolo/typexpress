import { Request } from "express"
import WebSocket from "ws"
import url, { URLSearchParams } from 'url'

import { HttpService } from "../http/HttpService"
import { JWTActions } from "../jwt/JWTRepoService"
import { Bus } from "../../core/path/Bus"
import ErrorServiceActions from "../error/ErrorServiceActions"

import { SocketServerActions, IClient } from "./utils"
import { SocketCommunicator } from "./SocketCommunicator"



class SocketServerService extends SocketCommunicator {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-server",
			autostart: true,
			port: null,
			jwt: null,
			clients: [],
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
		}
	}

	/**
	 * Semplicemente il server WEB-SOCKET
	 */
	private server: WebSocket.Server = null

	protected async onInit() {
		super.onInit()
		const { autostart } = this.state
		if (!autostart) return
		await this.startListener()

	}

	protected async onDestroy() {
		debugger
		super.onDestroy()
		this.stopListener()
	}



	//#region FARM

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
		this.buildEventsServer()
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

		// controllo che il path sia giusto
		const wsUrl = url.parse(request.url)
		if (path && wsUrl.pathname != path) return

		// controllo se c'e' un autentificazione da fare
		let jwtPayload
		if (jwt) {
			jwtPayload = await this.getJwtPayload(request)
			const response = onAuth ? onAuth.bind(this)(jwtPayload) : jwtPayload!=null
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

	/**
	 * Ricavo il JWT-PAYLOAD dalla request di connessione
	 * @param request 
	 * @returns 
	 */
	private async getJwtPayload(request: Request) {
		const { jwt } = this.state
		const index = request.url.lastIndexOf("?")
		const querystring = (index == -1 ? url : request.url.slice(index)) as string
		const params = new URLSearchParams(querystring)
		const token = params.get("token")
		if (!token) return null
		const payload = await new Bus(this, jwt).dispatch({ type: JWTActions.DECODE, payload: token })
		return payload
	}

	/** Fine della storia */
	private async stopListener() {
		if (!this.server) return
		this.server.close()
		this.detachToServerHttp()
		this.server = null
	}

	/**
	 * Si mette in ascolto sugli eventi del SERVER-WEB-SOCKET
	 */
	private buildEventsServer() {

		this.server.on('connection', (cws: WebSocket, req: Request, jwtPayload: any) => {
			const client = {
				remoteAddress: req.connection.remoteAddress,
				remotePort: req.connection.remotePort
			}
			this.buildEventsClient(cws, jwtPayload)
			this.addClient(client) //this.updateClients()
			this.onConnect(client, jwtPayload)
		})

		this.server.on("error", (error) => { console.log("server:error:"); debugger })

		this.server.on("close", (cws: WebSocket) => { console.log("server:close:"); debugger })
	}

	/**
	 * Si mette in ascolto sugli eventi del CLIENT-WEB-SOCKET arrivato al server
	 * @param cws CLIENT-WEB-SOCKET
	 * @param jwtPayload il JWT-PAYLOAD della connessione JWT-TOKEN
	 */
	private buildEventsClient(cws: WebSocket, jwtPayload: any) {

		cws.on('message', (message: string) => {
			const client = this.findClientByCWS(cws)
			this.onMessage(client, message, jwtPayload)
		})

		cws.on('error', (error) => { debugger })

		cws.on('close', (code: number, reason: string) => {
			const client = this.findClientByCWS(cws)
			this.updateClients()
			this.onDisconnect(client) //this.removeClient(client)
		})

	}

	//#endregion



	//#region ROOM

	/**
	 * Restituisce un CLIENT-WEB-SOCKET tramite CLIENT-JSON
	 * @param client 
	 * @returns 
	 */
	private findCWSByClient(client: IClient) {
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
		const clients: Array<IClient> = [...this.server.clients].map((cws: WebSocket) => {
			const socket = (cws as any)._socket
			return {
				remoteAddress: socket.remoteAddress,
				remotePort: socket.remotePort
			}
		})
		this.setState({ clients })
	}

	private addClient(client: IClient) {
		const { clients } = this.state
		clients.push(client)
		this.setState({ clients })
	}

	private removeClient(client: IClient) {
		const { clients } = this.state
		const clientsnew = clients.filter(c => !clientIsEqual(client, c))
		this.setState({ clients: clientsnew })
	}

	//#endregion



	//#region COMMUNICATOR 

	sendToClient(client: IClient, message: any) {
		const cws: WebSocket = this.findCWSByClient(client)
		try {
			if (cws.readyState === WebSocket.OPEN) {
				cws.send(message)
			}
		} catch (error) {
			new Bus(this, "/error").dispatch({ type: ErrorServiceActions.NOTIFY, payload: { code: "ws:send", error } })
		}
	}

	sendToAll(message: any) {
		this.server.clients.forEach(cws => {
			if (cws.readyState === WebSocket.OPEN) {
				try {
					cws.send(message)
				} catch (error) {
					new Bus(this, "/error").dispatch({ type: ErrorServiceActions.NOTIFY, payload: { code: "ws:broadcast", error } })
				}
			}
		})
	}

	disconnectClient(client: IClient) {
		const cws: WebSocket = this.findCWSByClient(client)
		cws.close()
	}

	getClients(): IClient[] {
		return this.state.clients
	}

	//#endregion

}

export default SocketServerService


function clientIsEqual(client: IClient, ws: IClient): boolean {
	return client.remoteAddress == ws.remoteAddress && client.remotePort == ws.remotePort
}
