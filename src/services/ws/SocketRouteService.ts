import { ServiceBase } from "../../core/ServiceBase"
import { IClient, IMessage } from "./index"
import { SocketServerActions } from "./index"
import  SocketServerService  from "./SocketServerService"

import { Bus } from "../../core/path/Bus"
import { PathFinder } from "../../core/path/PathFinder"



class SocketRouteService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-route",
			path: null,
			onConnect: null,
			onDisconnect: null,
			onMessage: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[SocketServerActions.SEND]: (state, payload: { client: IClient, message: IMessage }) => {
				const { client, message } = payload
				this.sendToClient(client, message)
			},
		}
	}

	onMessage(client: IClient, message: IMessage, jwtPayload: any) {
		const { onMessage } = this.state
		if (onMessage) onMessage.bind(this)(client, message, jwtPayload)
	}

	sendToClient(client: IClient, message: IMessage) {
		new Bus(this, "<~SocketServerService").dispatch({
			type: SocketServerActions.SEND,
			payload: message
		})
	}

	sendToAll(message: IMessage) {
		const parentServer = new PathFinder(this).getNode<SocketServerService>("<~SocketServerService")
		const clients = this.getClients()
		clients.forEach( client => {
			parentServer.sendToClient(client, message)
		})
	}

	getClients(): IClient[] {
		const { clients } = (this.parent as ServiceBase).state
		return clients
	}

}

export default SocketRouteService
