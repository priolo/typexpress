/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { Bus } from "../../../core/path/Bus"
import { JWTActions } from "../../jwt/JWTRepoService"
import SocketServerService from "../SocketServerService"
import { SocketServerActions } from "../index"

import WebSocket from "ws"



const PORT = 5004
let root = null



beforeAll(async () => {
	root = await RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					class: "ws/server",
					jwt: "/jwt",
					onAuth: function (jwtPayload) {
						return true
					},
					onMessage: async function (client, message, jwtPayload) {
						await this.dispatch({
							type: SocketServerActions.SEND,
							payload: { client, message: JSON.stringify(jwtPayload) }
						})
						await this.dispatch({
							type: SocketServerActions.DISCONNECT,
							payload: client
						})
					},
				},
			]
		},
		{
			class: "jwt",
			secret: "secret_word!!!"
		},
	])
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const wss = new PathFinder(root).getNode<SocketServerService>("/http/ws-server")
	expect(wss).toBeInstanceOf(SocketServerService)
})

test("client connetc/send/close", async () => {

	const user = { id: 3, name: "ivano" }
	const token = await new Bus(root, "/jwt").dispatch({
		type: JWTActions.ENCODE, payload: { payload: user }
	})
	const client = new WebSocket(`ws://localhost:${PORT}?token=${token}`)
	let result

	await (async () => {
		let resolver = null
		const promise = new Promise(res => resolver = res)
		client.on('open', () => {
			client.send("from client1")
		})
		client.on('message', (message) => {
			result = JSON.parse(message.toString())
		});
		client.on('close', () => {
			resolver()
		})
		return promise
	})()
	expect(result).toMatchObject(user)
})

test("client no auth", async () => {

	const client = new WebSocket(`ws://localhost:${PORT}`)

	const result = await (async () => {
		let resolver = null
		const promise = new Promise(res => resolver = res)
		client.on('error', (error) => {
			resolver("error")
		})
		return promise
	})()
	expect(result).toBe("error")

})