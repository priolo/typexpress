import { IClient, SocketRouteActions } from "../../../services/ws"
import { SocketCommunicator } from "../../../services/ws/SocketCommunicator"
import { ServerObjects } from "../ServerObjects"
import { ClientInitMessage, ClientUpdateMessage, ServerInitMessage } from "../types"



export class WSServerComunication {

	constructor(server: ServerObjects, wsNode: SocketCommunicator) {
		this.serverObjects = server
		this.wsNode = wsNode
	}

	private serverObjects: ServerObjects
	private wsNode: SocketCommunicator

	receive(message: any, client: IClient) {
		//const message = JSON.parse(messageStr)
		switch (message.type) {

			case "c:init": {
				const msgInit = message as ClientInitMessage
				const data = this.serverObjects.getObject(msgInit.payload.idObj, client)
				// invio lo stato iniziale
				const msg: ServerInitMessage = {
					type: "s:init",
					idObj: data.idObj,
					data: data.value,
					version: data.listeners[data.listeners.length - 1].lastVersion
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
	
	async send(client: IClient, msg: any) {
		await this.wsNode.dispatch({
			type: SocketRouteActions.SEND,
			payload: { client, message: JSON.stringify(msg) }
		})
	}
}
