import { ServerObjects } from "../ServerObjects"
import { ClientInitMessage, ClientUpdateMessage, ServerInitMessage } from "../types"
import { delay } from "../utils"
import { MemClientComunication } from "./MemClientComunication"




export class MemServerComunication {
	constructor(serverObjects: ServerObjects) {
		this.serverObjects = serverObjects
	}

	private serverObjects: ServerObjects

	receive(messageStr: string, client: MemClientComunication) {
		const message = JSON.parse(messageStr)
		switch (message.type) {

			case "c:init": {
				const msgInit = message as ClientInitMessage
				const data = this.serverObjects.getObject(msgInit.payload.idObj, client)
				// invio lo stato iniziale
				const msg: ServerInitMessage = {
					type: "s:init",
					idObj: data.idObj,
					data: [...data.value],
					version: data.actions[data.actions.length - 1]?.version ?? 0
				}
				this.send(client, msg)
				break
			}

			case "c:update": {
				const msgUp = message as ClientUpdateMessage
				this.serverObjects.updateFromAction(msgUp.payload.idObj, msgUp.payload.commands, msgUp.payload.atVersion)
				break
			}
		}
	}

	async send(client: MemClientComunication, msg: any) {
		await delay(100)
		if ( !client.isOnline ) throw new Error("Client is offline")
		await delay(100)
		client.receive(JSON.stringify(msg))
	}
}