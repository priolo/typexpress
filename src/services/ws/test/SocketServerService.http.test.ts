/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import SocketServerService, { SocketServerActions } from "../SocketServerService"
import WebSocket from "ws"


const PORT = 5004
let root = null




beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
			port: PORT,
			onConnect: function (client) {
				console.log("onConnection!!!")
			},
			onMessage: async function (client, data) {
				await this.dispatch({
					type: SocketServerActions.SEND,
					payload: { client, data }
				})
				await this.dispatch({
					type: SocketServerActions.DISCONNECT,
					payload: client
				})
			},
			onDisconnect: function ( client) {
				console.log("onDisconnect")
			}
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const wss = new PathFinder(root).getNode<SocketServerService>("/ws-server")
	expect(wss).toBeInstanceOf(SocketServerService)
})

test("client connetc/send/close", async () => {
	
	const dateNow = Date.now().toString()
	let result

	const ws = new WebSocket(`ws://localhost:${PORT}/`);

	await (async ()=> {
		let resolver = null
		const promise = new Promise(res => resolver = res)

		ws.on('open', function open() {
			ws.send(dateNow)
		});
	
		ws.on('message', (data) => {
			result = data
		});
	
		ws.on('close', function close() {
			resolver()
		});
		return promise
	})()

	expect(dateNow).toBe(result)
	
})