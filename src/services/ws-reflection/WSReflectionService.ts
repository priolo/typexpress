import { SocketCommunicator } from "../ws/SocketCommunicator.js"




export type WSReflectionRouteConf = Partial<WSReflectionRouteService['stateDefault']> & { class: "ws/route" }

export class WSReflectionRouteService extends SocketCommunicator {
	
	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-reflection",
		}
	}

	
}
