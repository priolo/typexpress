import { ServerObjects } from "../ServerObjects"
import { ClientObjects } from "../ClientObjects"
import { MemClientComunication } from "../comunicators/MemClientComunication"
import { MemServerComunication } from "../comunicators/MemServerComunication"
import { delay } from "../utils"
import { ApplyAction } from "../applicators/SlateApplicator"



beforeAll(async () => {
})

afterAll(async () => {
})

test("send actions", async () => {
	const myServer = new ServerObjects()
	myServer.apply = ApplyAction
	const myClient = new ClientObjects()
	myClient.apply = ApplyAction

	const serverCom = new MemServerComunication(myServer)
	const clientCom = new MemClientComunication(myClient, serverCom)

	myClient.observe("pippo", (data) => {
		console.log(data)
	})

	await clientCom.requestInit("pippo")

	await delay(500)

	clientCom.requestCommand("pippo", {
		"type": "insert_text",
		"path": [0, 0], "offset": 0,
		"text": "pluto"
	})
	clientCom.requestCommand("pippo", {
		"type": "remove_text",
		"path": [0, 0], "offset": 2,
		"text": "ut"
	})

	await delay(200)
	myServer.updateToClient(serverCom)
	await delay(200)
	myServer.updateToClient(serverCom)
	await delay(500)
	myServer.updateToClient(serverCom)

	await delay(1000)

	expect(myServer.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])
	expect(myClient.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])
}, 100000)

