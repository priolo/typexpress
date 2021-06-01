import { SocketCommunicator } from "./SocketCommunicator"



class SocketRouteService extends SocketCommunicator {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "ws-route",
		}
	}

}

export default SocketRouteService
