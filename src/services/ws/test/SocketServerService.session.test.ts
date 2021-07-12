/**
 * @jest-environment node
 */
import { RootService } from "../../../core/RootService"
import { IMessage, IClient, clientIsEqual } from "../utils"
import SocketRouteService from "../SocketRouteService"
import { wsFarm, wait, getRandom } from "../../../test_utils"
import WebSocket from "ws"


const PORT = 5004
let root = null

class PluginSession extends SocketRouteService {

	clientsCache: IClient[] = []


	onConnect(client: IClient) {
		super.onConnect(client)
		// se lo trovo tra quelli disconnessi allora gli mando i messaggi in cache
		let index = this.clientsCache.findIndex(c => c.params.id == client.params.id)
		if (index != -1) {
			const [cdel] = this.clientsCache.splice(index, 1)
			//wait(500).then( ()=> {
			cdel["cache"].forEach(message => this.sendToClient(client, message))
			//})
		}
	}

	onDisconnect(client: IClient) {
		super.onDisconnect(client)
		client["cache"] = []
		this.clientsCache.push(client)
	}

	onMessage(client: IClient, message: IMessage) {
		//super.onMessage(client, message)
		if (message.action == "to-all") {
			this.sendToAll(message)
		}
	}

	sendToClient(client: IClient, message: any) {
		// il cleint è chiuso metto in cache
		if (client["cache"]) {
			client["cache"].push(message)
			// altrimenti lo mando regolarmente
		} else {
			super.sendToClient(client, message)
		}
	}

	getClients(): IClient[] {
		return super.getClients().concat(this.clientsCache)
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

test("manage cache", async () => {

	// creo i clients
	const tmpIds = []
	const clients = await wsFarm(
		(index) => {
			tmpIds[index] = getRandom(1, 9999)
			return `ws://localhost:${PORT}/?id=${tmpIds[index]}`
		},
		3,
		(client, index) => client["id_session"] = tmpIds[index]
	)

	// disconnetto un client
	const clientClose = clients[0]
	await new Promise((res, rej) => {
		clientClose.once("close", res)
		clientClose.close()
	})

	// mando un messaggio a tutti
	const clientSend = clients[1]
	const txtOrigin = "messagge from: " + clientSend["id_session"]
	await new Promise<void>((res, rej) => {
		clientSend.once("message", res)
		clientSend.send(JSON.stringify({
			action: "to-all",
			payload: txtOrigin
		}))
	})

	// aspetto un po'
	await wait(500)

	// riconnetto il client disconnesso precedentemente
	let txtReceive
	await new Promise<void>(async (res, rej) => {
		const [clientRestore] = await wsFarm(() => `ws://localhost:${PORT}/?id=${clientClose["id_session"]}`, 1,
			(client) => {
				client.once("message", (message:string) => {
					const msg = JSON.parse(message)
					txtReceive = msg.payload
					res()
				})
			}
		)
	})

	expect(txtOrigin).toBe(txtReceive)
})

