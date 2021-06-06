/**
 * @jest-environment node
 */
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { IMessage, IClient } from "../utils"
import SocketRouteService from "../SocketRouteService"
import {distancePoints,getRandom,wsFarm,wait} from "../../../test_utils"


const PORT = 5004
let root = null

class RouteCustom extends SocketRouteService {
	onMessage(client: IClient, message: IMessage) {
		if (message.action == "position") {
			client["position"] = message.payload
		} else if (message.action == "radar") {
			const distance = message.payload
			const clients = this.getClients()
				.filter(c => distancePoints(c["position"], client["position"]) <= distance)
			this.sendToClients(clients, "vicinivicini")
		}
	}
}

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
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

test("su creazione", async () => {
	let srs = new PathFinder(root).getNode<SocketRouteService>('/ws-server/{"path":"room1"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
	srs = new PathFinder(root).getNode<SocketRouteService>('/ws-server/{"path":"room2"}')
	expect(srs).toBeInstanceOf(SocketRouteService)
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

	await new Promise<void>( async (res, rej) => {

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

