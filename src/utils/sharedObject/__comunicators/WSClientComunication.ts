import WebSocket from "ws"
import { ClientObjects } from "../ClientObjects"
import { ClientInitMessage, ClientUpdateMessage, ServerInitMessage, ServerUpdateMessage } from "../types"



export class WSClientComunication {

	constructor(client: ClientObjects, ws: WebSocket) {
		this.ws = ws
		this.clientObjects = client
		ws.on("message", (message) => {
			this.receive(message.toString())
		})
	}

	private clientObjects: ClientObjects
	private ws: WebSocket
	private initResolve: ((value: void | PromiseLike<void>) => void) | null = null

	async requestInit(idObj: string): Promise<void> {
		const message: ClientInitMessage = {
			type: "c:init",
			payload: { idObj }
		}
		const promise = new Promise<void>(resolve => {
			this.initResolve = resolve
		})
		this.send(message)
		return promise
	}

	requestCommand(idObj: string, command: any) {
		const data = this.clientObjects.objects[idObj]
		if (!data) throw new Error("Object not found")
		const message: ClientUpdateMessage = {
			type: "c:update",
			payload: {
				idObj: idObj,
				atVersion: data.version,
				command: command,
			},
		}
		this.send(message)
	}

	async receive(messageStr: string) {
		const message = JSON.parse(messageStr)
		switch (message.type) {
			case "s:init": {
				const msgInit = message as ServerInitMessage
				this.clientObjects.setObject(msgInit.idObj, msgInit.data, msgInit.version)
				if (this.initResolve) {
					this.initResolve()
					this.initResolve = null
				}
				break
			}
			case "s:update": {
				const msgUp = message as ServerUpdateMessage
				this.clientObjects.updateObject(msgUp.idObj, msgUp.actions)
				break
			}
		}

	}

	async send(message: any) {
		this.ws.send(JSON.stringify(message))
	}
}
