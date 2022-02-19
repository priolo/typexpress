/**
 * @jest-environment node
 */
 import WebSocket from "ws"

import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { Bus } from "../../../core/path/Bus"

import * as jwtNs from "../../jwt"
import * as wsNs from "../index"
import { getFreePort } from "../utils"




let PORT
let root = null

beforeAll(async () => {
	PORT = await getFreePort()
	root = await RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					class: "ws",
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
	const wss = new PathFinder(root).getNode<wsNs.Service>("/http/ws-server")
	expect(wss).toBeInstanceOf(wsNs.Service)
})

test("connessione con TOKEN JWT", async () => {

	const user = { id: 3, name: "ivano" }
	const token = await new Bus(root, "/jwt").dispatch({
		type: jwtNs.Actions.ENCODE, payload: { payload: user }
	})
	const client = new WebSocket(`ws://localhost:${PORT}?token=${token}`)
	let result

	client.on('open', () => {
		client.send("from client1")
	})
	client.on('message', (message) => {
		result = JSON.parse(message.toString())
	})
	await new Promise<void>((res, rej) => client.on('close', res))

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