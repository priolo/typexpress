/**
 * @jest-environment node
 */
import { RootService } from "../../../core/RootService"
import { IMessage, IClient, clientIsEqual } from "../utils"
import SocketRouteService from "../SocketRouteService"
import { wsFarm, wait, getRandom } from "../../../test_utils"


const PORT = 5004
let root = null

class PluginSession extends SocketRouteService {

	clientsCache: IClient[] = []


	onConnect(client: IClient, jwt, params) {
		super.onConnect(client, jwt, params)
		let index = this.clientsCache.findIndex( c => c["id"]==params.id )
		if ( index!=-1 ) {
			const cdel = this.clientsCache.splice(index, 1)
			client = { ...cdel, ...client }
		}
		client["id"] =  params.id
		//this.sendToClient(client, { action:"connected", id: sessionId })
	}

	onDisconnect(client: IClient) {
		super.onDisconnect(client)
		this.clientsCache.push(client)
	}

	onMessage(client: IClient, message: IMessage) {
		super.onMessage(client, message)
		this.sendToClient(client, "resend:session:" + client["session_id"])
	}

	sendToClient(client: IClient, message: any) {
		super.sendToClient(client, message)
		let index = this.clientsCache.findIndex( c => c["id"]==client["id"] )
		if ( index!=-1 ) {

		}
	}

	getClients(): IClient[] {
		if (!(this.parent instanceof SocketCommunicator)) return
		return this.parent.getClients()
	}

}

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
			port: PORT,
			children: [
				{
					class: PluginSession,
				},
			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("send send/receive position near", async () => {

	//const { index, code } = await new Promise<any>(async (res, rej) => {
		const clients = await wsFarm(
			()=> `ws://localhost:${PORT}/?id=${getRandom(1, 9999)}`,
			3,
			(client, index) => {
				// // simulo il malfunzionamento del client 1
				// if (index == 1) client["pong"] = () => { }
				// client.on("close", (code, reason) => {
				// 	res({ index, code })
				// })
			}
		)
	//})
debugger
	// expect(index).toBe(1)
	// expect(code).toBe(1005) // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent?retiredLocale=it
})

