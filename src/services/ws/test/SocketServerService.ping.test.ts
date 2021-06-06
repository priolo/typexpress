/**
 * @jest-environment node
 */
import { RootService } from "../../../core/RootService"
import { IMessage, IClient } from "../utils"
import SocketRouteService from "../SocketRouteService"
import { wsFarm, wait } from "../../../test_utils"


const PORT = 5004
let root = null

class PluginPing extends SocketRouteService {

	protected async onInit(): Promise<void> {
		await super.onInit()
		this.idTimer = setTimeout(this.check.bind(this), 1000)
	}
	protected async onDestroy(): Promise<void> {
		await super.onInit()
		clearTimeout(this.idTimer)
	}
	idTimer

	check() {
		const clients = this.getClients()
		clients.forEach(client => {
			const deltaTime = Date.now() - client["lastPing"]
			// è passato meno del tempo previsto dall'ultimo ping allora non fare nulla
			if (deltaTime < 500) return
			// ...altrimenti manda un ping e aspetta al massimo 300ms
			this.sendPing(client, 300)
				.then(time => {
					client["lastPing"] = Date.now()
					if (time == 300) {
						this.disconnectClient(client)
					}
				})
		})
	}

	onConnect(client: IClient) {
		super.onConnect(client)
		client["lastPing"] = Date.now()
	}

	onMessage(client: IClient, message: IMessage) {
		super.onMessage(client, message)
		client["lastPing"] = Date.now()
	}
}

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "ws/server",
			port: PORT,
			children: [
				{
					class: PluginPing,
				},
			]
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("send send/receive position near", async () => {

	const { index, code } = await new Promise<any>(async (res, rej) => {
		const clients = await wsFarm(
			`ws://localhost:${PORT}/`,
			3,
			(client, index) => {
				// simulo il malfunzionamento del client 1
				if (index == 1) client["pong"] = () => { }
				client.on("close", (code, reason) => {
					res({ index, code })
				})
			}
		)
	})

	expect(index).toBe(1)
	expect(code).toBe(1005) // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent?retiredLocale=it
})

