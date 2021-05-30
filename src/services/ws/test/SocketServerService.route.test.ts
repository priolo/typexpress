/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import SocketServerService, { SocketServerActions } from "../SocketServerService"
import SocketRouteService from "../SocketRouteService"

import WebSocket from "ws"



const PORT = 5004
let root = null




beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
			port: PORT,
			onConnect: function (client) {
				console.log("onConnect")
			},
			onMessage: async function (client, message) {
				await this.dispatch({
					type: SocketServerActions.SEND,
					payload: { client, message }
				})
				await this.dispatch({
					type: SocketServerActions.DISCONNECT,
					payload: client
				})
			},
			onDisconnect: function ( client) {
				console.log("onDisconnect")
			},
			children: [
				{
					class: "ws/route",
					path: "command",
					onMessage: async function (client, payload) {
						const { message } = payload
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: `receive:${message}` }
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
							payload: { client, message: `receive:${message}` }
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
	let srs = new PathFinder(root).getNode<SocketRouteService>('/{"path":"command"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
	srs = new PathFinder(root).getNode<SocketRouteService>('/{"path":"room1"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
})

test("client connetc/send/close", async () => {
	
	const dateNow = Date.now().toString()
	let result

	const ws = new WebSocket(`ws://localhost:${PORT}/`);

	await (async ()=> {
		let resolver = null
		const promise = new Promise(res => resolver = res)

		ws.on('open', function open() {
			ws.send({
				path: "test",
				action: "message",
				payload: { message: "ciao!"},
			})
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