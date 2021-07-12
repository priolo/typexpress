/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { Bus } from "../../../core/path/Bus"
import { JWTActions } from "../../jwt/JWTRepoService"
import SocketServerService from "../SocketServerService"

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
						return jwtPayload != null
					},
					onMessage: async function (client, message) {
						this.sendToClient(client, JSON.stringify(client.jwtPayload))
						this.disconnectClient(client)
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

test("connessione con TOKEN JWT", async () => {

	const user = { id: 3, name: "ivano" }
	const token = await new Bus(root, "/jwt").dispatch({
		type: JWTActions.ENCODE, payload: { payload: user }
	})
	const client = new WebSocket(`ws://localhost:${PORT}?token=${token}`)
	let result

	client.on('open', () => {
		client.send("from client1")
	})
	client.on('message', (message) => {
		result = JSON.parse(message.toString())
	})
	await new Promise<void>((res, rej) => {
		client.on('close', () => {
			res()
		})
	})

	expect(result).toMatchObject(user)
})

test("non è concesso l'accesso senza TOKEN JWT", async () => {

	const client = new WebSocket(`ws://localhost:${PORT}`)

	const result = await new Promise<string>( (resolver, rej) =>{
		client.on('error', (error) => {
			resolver("error")
		})
	})

	expect(result).toBe("error")

})