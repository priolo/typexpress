class WSServerComunication {

	constructor(server: ServerObjects, wsNode: SocketCommunicator) {
		this.serverObjects = server
		this.wsNode = wsNode
	}

	private serverObjects: ServerObjects
	private wsNode: SocketCommunicator

	async receive(messageStr: string, client: IClient) {
		const message = JSON.parse(messageStr)
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
				this.serverObjects.updateFromAction(msgUp.payload.idObj, msgUp.payload.action, msgUp.payload.atVersion)
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

