/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import WebSocket from "ws"

import { SocketRouteActions } from "../utils"
import * as wsNs from "../index"



const PORT = 5004
let root = null


beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws",
			port: PORT,
			children: [
				{
					class: "ws/route",
					onMessage: async function (client, message) {
						await this.dispatch({
							type: SocketRouteActions.SEND,
							payload: { client, message }
						})
						await this.dispatch({
							type: SocketRouteActions.DISCONNECT,
							payload: client
						})
					},
				}
			],
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

	const dateNow = Date.now().toString()

	const ws = new WebSocket(`ws://localhost:${PORT}/`);

	const result = await new Promise<string>( (res, rej) =>{
		let result
		ws.on('open', function open() {
			ws.send(dateNow)
		});
		ws.on('message', (data) => {
			result = data
		});
		ws.on('close', function close() {
			res(result)
		});
	})

	expect(dateNow).toBe(result)

})
