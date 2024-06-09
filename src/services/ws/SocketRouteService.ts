import { SocketCommunicator, SocketCommunicatorConf } from "./SocketCommunicator.js"



export class SocketRouteService extends SocketCommunicator {

	get stateDefault(): SocketCommunicatorConf {
		return {
			...super.stateDefault,
			name: "ws-route",
		}
	}

}

