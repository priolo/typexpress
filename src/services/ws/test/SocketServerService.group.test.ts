/**
 * @jest-environment node
 */
import { RootService } from "../../../core/RootService"
import { distancePoints, getRandom, wsFarm, wait } from "../../../test_utils"

import * as wsNs from "../index"



const PORT = 5004
let root = null

class RouteCustom extends wsNs.Service {
	onMessage(client: wsNs.IClient, message: wsNs.IMessage) {
		if (message.action == "position") {
			client["position"] = message.payload
		} else if (message.action == "radar") {
			const distance = message.payload
			const clients = this.getClients()
				.filter(c => distancePoints(c["position"], client["position"]) <= distance)
				.forEach(c => this.sendToClient(c, "vicinivicini"))
		}
	}
}

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws",
			port: PORT,
			children: [
				{
					class: RouteCustom,
					path: "near",
				},
			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("send send/receive position near", async () => {

	const distance = 10
	const positions = Array.from<any, { x: number, y: number }>({ length: 50 }, _ => ({ x: getRandom(1, 100), y: getRandom(1, 100) }))
	const senderIndex = getRandom(0, positions.length - 1)
	const indexNear = positions.reduce((acc, position, index) => {
		if (distancePoints(positions[senderIndex], position) <= distance) acc.push(index)
		return acc
	}, [])

	const indexReceive = []

	await new Promise<void>(async (res, rej) => {

		// creo e mando la posizione dei client
		const clients = await wsFarm(`ws://localhost:${PORT}/`, positions.length, (client, index) => {

			client.send(JSON.stringify({ path: "near", action: "position", payload: positions[index] }))

			// il client "near" riceve il messaggio "radar" del CLIENT-RANDOM
			client.on('message', message => {
				indexReceive.push(index)
				// quando tutti i client "near" ricevono il messaggio allora concludi il Promise
				if (indexReceive.length == indexNear.length) {
					res()
				}
			})
		})

		// aspetto che tutte le posizioni siano mandate
		await wait(1000)

		// di un CLIENT-RANDOM manda un MESSAGE "radar" da consegnare a tutti i suoi "near"
		clients[senderIndex].send(JSON.stringify({ path: "near", action: "radar", payload: distance }))
	})

	indexNear.sort()
	indexReceive.sort()
	expect(indexNear).toEqual(indexReceive)
})

