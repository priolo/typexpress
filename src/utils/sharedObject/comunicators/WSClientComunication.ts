
class WSClientComunication {
	constructor(client: ClientObjects, ws: WebSocket) {
		this.ws = ws
		this.client = client
	}

	private client: ClientObjects
	private ws: WebSocket

	async requestObject(idObj: string) {
		const message: ClientInitMessage = {
			type: "c:init",
			payload: { idObj }
		}
		this.ws.send(JSON.stringify(message))
	}

	async receive(messageStr: string) {
		const message = JSON.parse(messageStr)
		switch (message.type) {
			case "s:init": {
				const msgInit = message as ServerInitMessage
				this.client.setObject(msgInit.idObj, msgInit.data, msgInit.version)
				break
			}
			case "s:update": {
				const msgUp = message as ServerUpdateMessage
				this.client.updateObject(msgUp.idObj, msgUp.actions)
				break
			}
		}

	}
}
