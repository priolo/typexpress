import { SocketCommunicator } from "./SocketCommunicator.js"



export type SocketRouteConf = Partial<SocketRouteService['stateDefault']> 
	& { class: "ws/route" | `npm:julian-ws-${string}` | (new (...args: any[]) => SocketRouteService) }

export class SocketRouteService extends SocketCommunicator {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "ws-route",
		}
	}

}
