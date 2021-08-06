/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import WebSocket from "ws"

import * as wsNs from "../index"



const PORT = 5004
let root = null

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws",
			port: PORT,
			onMessage: async function (client, data) {
				this.sendToClient(client, `root::receive:${data}`)
			},
			children: [
				{
					class: "ws/route",
					path: "command",
					onMessage: async function (client, data) {
						this.sendToClient(client, `command::receive:${data.payload.message}`)
					},
				},
				{
					class: "ws/route",
					path: "room1",
					children: [{
						class: "ws/route",
						path: "pos2",
						onMessage: async function (client, message) {
							this.sendToClient(client, `room1/pos2::receive:${message.payload.message}`)
						},
					}],
				},
			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("su creazione", async () => {
	let srs = new PathFinder(root).getNode<wsNs.Service>('/ws-server/{"path":"command"}')
	expect(srs).toBeInstanceOf(wsNs.Service)
	srs = new PathFinder(root).getNode<wsNs.Service>('/ws-server/{"path":"room1"}')
	expect(srs).toBeInstanceOf(wsNs.Service)
})

test("message on subpath", async () => {
	let result = []
	const ws = new WebSocket(`ws://localhost:${PORT}/`)
	
	ws.on('open', () => {
		ws.send("only string")
		ws.send(JSON.stringify({
			path: "room1/pos2", action: "message",
			payload: { message: "<room1-pos2>" },
		}))
		ws.send(JSON.stringify({
			path: "command", action: "message",
			payload: { message: "<command>" },
		}))
	})

	ws.on('message', message => {
		result.push(message)
		if (result.length == 3) ws.close()
	})

	await new Promise<void>((res, rej) => ws.on('close', res))

	expect(result).toEqual([
		"root::receive:only string",
		"room1/pos2::receive:<room1-pos2>",
		"command::receive:<command>",
	])
})
