/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { SocketServerActions } from "../utils"
import SocketRouteService from "../SocketRouteService"

import WebSocket from "ws"

class RouteCustom extends SocketRouteService {

}

const PORT = 5004
let root = null

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
			port: PORT,
			children: [
				
				{
					class: "ws/route",
					path: "command",
					onMessage: async function (client, data) {
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: `command::receive:${data.payload.message}` }
						})
					},
				},

				{
					class: "ws/route",
					path: "room1",
					onMessage: async function (client, payload) {
						const { message } = payload
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: `room1::receive:${message}` }
						})
					},
				},

				{
					class: RouteCustom,
					path: "room2",
				}

			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("su creazione", async () => {
	let srs = new PathFinder(root).getNode<SocketRouteService>('/ws-server/{"path":"command"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
	srs = new PathFinder(root).getNode<SocketRouteService>('/ws-server/{"path":"room1"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
})

test("client connetc/send/close", async () => {
	
	let result

	const ws = new WebSocket(`ws://localhost:${PORT}/`);

	await (async ()=> {
		let resolver = null
		const promise = new Promise(res => resolver = res)

		ws.on('open', function open() {
			ws.send(JSON.stringify({
				path: "command",
				action: "message",
				payload: { message: "ciao!"},
			}))
		});
	
		ws.on('message', message => {
			result = message
			ws.close()
		});
	
		ws.on('close', function close() {
			resolver()
		});
		return promise
	})()

	expect(result).toBe("command::receive:ciao!")
	
})
