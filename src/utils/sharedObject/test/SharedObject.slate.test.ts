import { ClientObjects } from "../ClientObjects"
import { ServerObjects } from "../ServerObjects"
import { ApplyAction } from "../applicators/SlateApplicator"
import { delay } from "../utils"



beforeAll(async () => {
})

afterAll(async () => {
})

test("send actions", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()

	myServer.apply = ApplyAction
	myServer.onSend = async (client, message) => {
		(<ClientObjects>client).receive(JSON.stringify(message))
	}
	myClient.apply = ApplyAction
	myClient.onSend = async (message) => {
		myServer.receive(JSON.stringify(message), myClient)
	}

	//const serverCom = new MemServerComunication(myServer)
	//const clientCom = new MemClientComunication(myClient, serverCom)

	myClient.observe("pippo", (data) => {
		console.log(data)
	})

	await myClient.init("pippo")

	await delay(500)

	myClient.command("pippo", {
		"type": "insert_text",
		"path": [0, 0], "offset": 0,
		"text": "pluto"
	})
	myClient.command("pippo", {
		"type": "remove_text",
		"path": [0, 0], "offset": 2,
		"text": "ut"
	})

	await delay(200)
	myServer.update()
	await delay(200)
	myServer.update()
	await delay(500)
	myServer.update()

	await delay(1000)

	expect(myServer.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])
	expect(myClient.objects["pippo"].value).toEqual([
		{ children: [{ text: "plo", }] },
	])
}, 100000)

