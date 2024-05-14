import { SocketCommunicator } from "./SocketCommunicator"



export class SocketRouteService extends SocketCommunicator {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "ws-route",
		}
	}

}

