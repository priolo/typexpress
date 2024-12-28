import { nodeToJson } from "src/core/utils.js"
import { SocketCommunicator } from "../ws/SocketCommunicator.js"
import { IClient } from "../ws/utils.js"
import { RefMessage, RefFromClientType, RefFromServerType } from "./utils.js"
import { PathFinder } from "src/core/path/PathFinder.js"



export type WSReflectionConf = Partial<WSReflectionService['stateDefault']>

/**
 * 
 */
export default class WSReflectionService extends SocketCommunicator {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "ws-reflection",
		}
	}

	get executablesMap(): any {
		return {
			...super.executablesMap,
		}
	}

	onMessage(client: IClient, message: string) {
		if (!client || !message) return
		const msg: RefMessage = JSON.parse(message)
		switch (msg.type) {
			case RefFromClientType.GET_STATE: {
				const { path } = msg.payload
				const node = PathFinder.Get(this, path ?? "/")
				this.sendToClient(client, {
					type: RefFromServerType.STATE,
					payload: nodeToJson(node)
				})
				break
			}
		}
		super.onMessage(client, message)
	}

	// sendToClient(client: IClient, message: any) {
	// 	super.sendToClient(client, message)
	// }
}
