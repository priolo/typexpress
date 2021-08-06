import { SocketCommunicator } from "./SocketCommunicator"



export default class SocketRouteService extends SocketCommunicator {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-route",
		}
	}

}

