/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import SocketServerService from "../SocketServerService"
import WebSocket from "ws"


const PORT = 5004
let root = null


beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "http",
			port: PORT,
			children: [
				{
					class: "ws/server",
					name: "ws1",
					path: "/server1",
					onMessage: async function (client, message) {
						this.sendToClient(client, "from ws1")
						this.disconnectClient(client)
					},
				},
				{
					class: "ws/server",
					name: "ws2",
					path: "/server2",
					onMessage: async function (client, message) {
						this.sendToClient(client, "from ws2")
						this.disconnectClient(client)
					},
				}
			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const ws1 = new PathFinder(root).getNode<SocketServerService>("/http/ws1")
	expect(ws1).toBeInstanceOf(SocketServerService)
	const ws2 = new PathFinder(root).getNode<SocketServerService>("/http/ws2")
	expect(ws2).toBeInstanceOf(SocketServerService)
})

test("verifica connetc/send/close su servizio WS montato su servizio HTTP ", async () => {
	
	let client = new WebSocket(`ws://localhost:${PORT}/server1`)
	let result = await new Promise<string>((res, rej) => {
		let result
		client.on('open', function open() {
			client.send("from client1")
		})
		client.on('message', (data) => {
			result = data
		})
		client.on('close', function close() {
			res(result)
		})
	})
	expect(result).toBe("from ws1")


	client = new WebSocket(`ws://localhost:${PORT}/server2`);
	result = await new Promise( (res, rej) => {
		let result
		client.on('open', function open() {
			client.send("from client2")
		})
		client.on('message', (data) => {
			result = data
		})
		client.on('close', function close() {
			res(result)
		})

	})
	expect(result).toBe("from ws2")

})