import { Request } from "express"
import url, { URLSearchParams } from 'url'
import WebSocket from "ws"
import { Bus } from "../../core/path/Bus"
import * as errorNs from "../error"
import * as http from "../http"
import * as jwtNs from "../jwt"
import LogService from "../log"
import { SocketCommunicator } from "./SocketCommunicator"
import { SocketRouteConf } from "./SocketRouteService"
import { Errors, IClient, IMessage, SocketServerActions, clientIsEqual } from "./utils"



export type SocketServerConf = Partial<SocketServerService['stateDefault']> & { class: "ws", children?: SocketRouteConf[]  }
export type SocketServerAct = SocketServerService['dispatchMap']

export class SocketServerService extends SocketCommunicator {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-server",
			autostart: true,
			port: <number>null,
			jwt: <string>null,
			clients: <IClient[]>[],
			onAuth: <(jwtPayload: string) => boolean>null,
		}
	}

	get dispatchMap() {
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
		if (!this.state.autostart) return
		await this.startListener()
	}

	protected async onDestroy() {
		super.onDestroy()
		await this.stopListener()
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
		return new Promise((res, rej) => {
			if (!this.state.port) rej("no port")
			this.server = new WebSocket.Server(
				{ port: this.state.port },
				() => res()
			)
		})
	}

	/**
	 * Attacca il SERVER-WEB-SOCKET al SERVER-HTTP superiore
	 */
	private attachToServerHttp() {
		const parentHttp = this.parent instanceof http.Service ? (<http.Service>this.parent).server : null
		if (!parentHttp) throw new Error("non c'e' il server http")

		this.server = new WebSocket.Server({ noServer: true })
		parentHttp.on('upgrade', this.onUpgrade)
		LogService.Send(this, "attached")
	}
	private detachToServerHttp() {
		const parentHttp = this.parent instanceof http.Service ? (<http.Service>this.parent).server : null
		if (!parentHttp) return
		parentHttp.off('upgrade', this.onUpgrade)
	}
	private onUpgrade = async (request, socket, head) => {
		let { path, jwt, onAuth } = this.state
		const params = this.getUrlParams(request)

		// controllo che il path sia giusto
		const wsUrl = url.parse(request.url)
		if (!path) path = ""
		if (!path.startsWith("/")) path = `/${path}`
		if (wsUrl.pathname != path) return

		// controllo se c'e' un autentificazione da fare
		let jwtPayload
		if (jwt) {
			jwtPayload = await this.getJwtPayload(params.token)
			const response = onAuth ? onAuth.bind(this)(jwtPayload) : jwtPayload != null
			if (!response) {
				socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
				socket.destroy()
				return
			}
		}

		// gestisce la connessione col client	
		// a qaunto pare non è possibile leggere l'header
		// https://stackoverflow.com/a/4361358/5224029		
		this.server.handleUpgrade(request, socket, head, (ws) => {
			this.server.emit('connection', ws, request, jwtPayload)
		})
	}

	private getUrlParams(request: Request): any {
		const index = request.url.lastIndexOf("?")
		const querystring = (index == -1 ? url : request.url.slice(index)) as string
		const params = new URLSearchParams(querystring)
		return Object.fromEntries(params)
	}

	/**
	 * Ricavo il JWT-PAYLOAD 
	 * @param token 
	 * @returns 
	 */
	private async getJwtPayload(token: string) {
		const { jwt } = this.state
		if (!token) return null
		const payload = await new Bus(this, jwt).dispatch({
			type: jwtNs.Actions.DECODE,
			payload: token
		})
		return payload
	}

	/** Fine della storia */
	private async stopListener() {
		if (!this.server) return
		return new Promise<void>((res, rej) => {
			this.server.close((err) => {
				if (err) rej(err); else res()
			})
			this.detachToServerHttp()
			this.server = null
		})
	}

	/**
	 * Si mette in ascolto sugli eventi del SERVER-WEB-SOCKET
	 * @param jwtPayload il JWT-PAYLOAD della connessione JWT-TOKEN
	 */
	private buildEventsServer() {

		// when a CLIENT conect
		this.server.on('connection', (cws: WebSocket, req: Request, jwtPayload: any) => {
			const params = this.getUrlParams(req)
			const client: IClient = {
				remoteAddress: req.socket.remoteAddress,
				remotePort: req.socket.remotePort,
				params,
				jwtPayload
			}
			this.buildEventsClient(cws)
			this.addClient(client) //this.updateClients()
			this.onConnect(client)
		})

		this.server.on("error", (error) => { console.log("server:error:"); /*debugger*/ })
		//this.server.on("close", (cws: WebSocket) => { console.log("server:close:"); /*debugger*/ })
	}

	/**
	 * Si mette in ascolto sugli eventi del CLIENT-WEB-SOCKET arrivato al server
	 * @param cws CLIENT-WEB-SOCKET
	 */
	private buildEventsClient(cws: WebSocket) {

		cws.on('message', (message: string) => {
			const client = this.findClientByCWS(cws)
			this.onMessage(client, message)
		})

		cws.on('error', (error) => { debugger })

		cws.on('close', (code: number, reason: string) => {
			const client = this.findClientByCWS(cws)
			this.updateClients()//this.removeClient(client)
			this.onDisconnect(client)
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
		const clients: Array<IClient> = !this.server ? []
			: [...this.server.clients].map((cws: WebSocket) => {
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

	//[II] DA FARE
	onProcessMessage(client: IClient, message: string | IMessage) {
	}

	/**
	 * Quando arriva un messaggio dal client
	 * @param client 
	 * @param message 
	 * @override
	 */
	onMessage(client: IClient, message: string | IMessage) {
		if (!message) return
		if (typeof message == "string" && message.length > 0) {
			try {
				message = JSON.parse(message)
			} catch (error) { }
		}
		const paths = message["path"]?.split("/").filter(path => path && path.length > 0)
		super.onMessage(client, message, paths)
	}

	sendToClient(client: IClient, message: any) {
		const cws: WebSocket = this.findCWSByClient(client)
		this.sendToCWS(cws, message)
	}

	sendToAll(message: any) {
		this.server.clients.forEach(cws => {
			this.sendToCWS(cws, message)
		})
	}

	async sendPing(client: IClient, timeout: number): Promise<number> {
		const cws: WebSocket = this.findCWSByClient(client)
		if (!cws) return
		return new Promise<number>((res, rej) => {
			const startTime = Date.now()

			const onPong = () => {
				clearTimeout(idTimer)
				const deltaTime = Date.now() - startTime
				res(deltaTime)
			}

			const idTimer = setTimeout(() => {
				cws.off("ping", onPong)
				clearTimeout(idTimer)
				res(timeout)
			}, timeout)

			cws.once("pong", onPong)
			cws.ping()
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

	private sendToCWS(cws: WebSocket, message: any): boolean {
		if (cws.readyState === WebSocket.OPEN) {
			if (typeof message != "string") message = JSON.stringify(message)
			try {
				cws.send(message)
			} catch (error) {
				new Bus(this, "/error").dispatch({
					type: errorNs.Actions.NOTIFY,
					payload: { code: Errors.BROADCAST, error }
				})
				return false
			}
			return true
		}
		return false
	}

}
