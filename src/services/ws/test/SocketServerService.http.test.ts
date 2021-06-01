/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import SocketServerService from "../SocketServerService"
import { SocketServerActions } from "../index"
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
					onConnect: (client) => console.log("ws1::onConnect"),
					onDisconnect: (client) => console.log("ws1::onDisconnect"),
					onMessage: async function (client, message) {
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: "from ws1" }
						})
						await this.dispatch({
							type: SocketServerActions.DISCONNECT,
							payload: client
						})
					},
				},
				{
					class: "ws/server",
					name: "ws2",
					path: "/server2",
					onConnect: (client) => console.log("ws2::onConnect"),
					onDisconnect: (client) => console.log("ws2::onDisconnect"),
					onMessage: async function (client, message) {
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: "from ws2" }
						})
						await this.dispatch({
							type: SocketServerActions.DISCONNECT,
							payload: client
						})
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

test("client connetc/send/close", async () => {

	let result
	let client = new WebSocket(`ws://localhost:${PORT}/server1`);

	await (async () => {
		let resolver = null
		const promise = new Promise(res => resolver = res)
		client.on('open', function open() {
			client.send("from client1")
		});
		client.on('message', (data) => {
			result = data
		});
		client.on('close', function close() {
			resolver()
		});
		return promise
	})()
	expect(result).toBe("from ws1")


	client = new WebSocket(`ws://localhost:${PORT}/server2`);
	await (async () => {
		let resolver = null
		const promise = new Promise(res => resolver = res)
		client.on('open', function open() {
			client.send("from client2")
		});
		client.on('message', (data) => {
			result = data
		});
		client.on('close', function close() {
			resolver()
		});
		return promise
	})()
	expect(result).toBe("from ws2")

})