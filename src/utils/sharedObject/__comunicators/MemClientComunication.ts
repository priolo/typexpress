import { ClientObjects } from "../ClientObjects"
import { ClientInitMessage, ClientUpdateMessage, ServerInitMessage, ServerUpdateMessage } from "../types"
import { delay } from "../utils"
import { MemServerComunication } from "./MemServerComunication"



export class MemClientComunication {

	constructor(clientObjects: ClientObjects, serverCom: MemServerComunication) {
		this.clientObjects = clientObjects
		this.serverCom = serverCom
	}

	/** usato per test */
	isOnline: boolean = true
	clientObjects: ClientObjects
	private serverCom: MemServerComunication
	private initResolve: ((value: void | PromiseLike<void>) => void) | null = null



	requestInit(idObj: string): Promise<void> {
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

	receive(messageStr: string) {
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

	async send(msg: any) {
		await delay(100)
		if (!this.isOnline) throw new Error("Client is offline")
		await delay(100)
		this.serverCom.receive(JSON.stringify(msg), this)
	}
}
