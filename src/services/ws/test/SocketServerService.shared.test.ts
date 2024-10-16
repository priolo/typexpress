import WebSocket from "ws"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { ApplyAction } from "../../../utils/sharedObject/applicators/SlateApplicator"
import { ClientObjects } from "../../../utils/sharedObject/ClientObjects"
import { ServerObjects } from "../../../utils/sharedObject/ServerObjects"
import { delay } from "../../../utils/sharedObject/utils"
import * as wsNs from "../index"
import { SocketServerConf } from "../SocketServerService"


let PORT: number = 52
let root: RootService
let myServer: ServerObjects
let myClient: ClientObjects


beforeAll(async () => {
	root = await RootService.Start(
		<SocketServerConf>{
			class: "ws",
			port: PORT,
			onMessage: async function (client, message: any) {
				myServer.receive(JSON.stringify(message), client)
			},
		}
	)
	myServer = new ServerObjects()
	myClient = new ClientObjects()
	myServer.apply = ApplyAction
	myClient.apply = ApplyAction
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const wss = new PathFinder(root).getNode<wsNs.Service>("/ws-server")
	expect(wss).toBeInstanceOf(wsNs.Service)
})

test("client connetc/send/close", async () => {

	const wss = new PathFinder(root).getNode<wsNs.Service>("/ws-server")
	const wsc = new WebSocket(`ws://localhost:${PORT}/`)

	myServer.onSend = async (client, message) => {
		wss.sendToClient(client, message)
	}
	myClient.onSend = async (message) => {
		wsc.send(JSON.stringify(message))
	}	

	await new Promise<string>((res, rej) => {
		wsc.on('open', () => {
			res("open")
		})
		wsc.on('message', (data) => {
			myClient.receive(data.toString())
		})
	})

	myClient.observe("pippo", (data) => {
		console.log(data)
	})

	await myClient.init("pippo")

	myClient.command("pippo", {
		"type": "insert_text",
		"path": [0, 0], "offset": 0,
		"text": "pluto"
	})
	myClient.command("pippo", {
		"type": "remove_text",
		"path": [0, 0], "offset": 2,
		"text": "ut"
	})

	await delay(200)
	myServer.update()
	await delay(200)
	myServer.update()
	await delay(500)
	myServer.update()
	await delay(1000)

	expect(myServer.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])
	expect(myClient.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])

}, 100000)
