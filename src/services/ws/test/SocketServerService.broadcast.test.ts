/**
 * @jest-environment node
 */
import { getFreePort } from ".."
import { RootService } from "../../../core/RootService"
import { wsFarm } from "../../../test_utils"


let PORT
let root = null

beforeAll(async () => {
	PORT = await getFreePort()
	root = await RootService.Start(
		{
			class: "ws",
			port: PORT,
			onMessage: async function (client, message) {
				this.sendToAll(message)
			},
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("send broadcast", async () => {

	const clientsLength = 5
	const clients = await wsFarm(`ws://localhost:${PORT}/`, clientsLength)

	const promises = clients.map(client => new Promise((res, rej) => {
		client.on('message', message => {
			client.close()
			res(message)
		})
	}))

	clients[0].send("message")

	const ret = await Promise.all(promises)

	expect(ret).toEqual(Array.from({ length: clientsLength }, _ => "message"))
})