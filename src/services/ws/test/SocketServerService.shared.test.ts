import WebSocket from "ws"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import * as wsNs from "../index"
import { SocketServerConf } from "../SocketServerService"
import { ArrayApplicator, ClientObjects, ServerObjects } from "@priolo/jess"


let PORT: number = 52
let root: RootService




beforeAll(async () => {
	root = await RootService.Start(
		<SocketServerConf>{
			class: "ws",
			port: PORT,
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const wss = new PathFinder(root).getNode<wsNs.Service>("/ws-server")
	expect(wss).toBeInstanceOf(wsNs.Service)
})

test("client connetc/send/close", async () => {
	const myServer= new ServerObjects()
	const wss: wsNs.Service = PathFinder.Get(root, "/ws-server")
	wss.emitter.on("message", ({ client, message }) => myServer.receive(message, client))	
	myServer.apply = ArrayApplicator.ApplyAction
	myServer.onSend = async (client, message) => wss.sendToClient(client, message)


	const myClient = new ClientObjects()
	const wsc = new WebSocket(`ws://localhost:${PORT}/`)
	myClient.apply = ArrayApplicator.ApplyAction
	myClient.onSend = async (message) => wsc.send(JSON.stringify(message))
	await new Promise<void>(res=> {
		wsc.on('open', () => res())
		wsc.on('message', (data) => myClient.receive(data.toString()))
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
