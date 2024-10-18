import { ClientObjects } from "../ClientObjects"
import { ServerObjects } from "../ServerObjects"
import { delay } from "../utils"
import {ApplyAction} from "../applicators/ArrayApplicator"


beforeAll(async () => {
})

afterAll(async () => {
})

// test("send actions 2", async () => {
// 	const myServer = new ServerObjects()
// 	const myClient = new ClientObjects()

// 	myServer.onSend = async (client, message) => (<ClientObjects>client).receive(JSON.stringify(message))
// 	myServer.apply = ApplyAction
// 	myClient.onSend = async (message) => myServer.receive(JSON.stringify(message), myClient)
// 	myClient.apply = ApplyAction

// 	await myClient.init("pippo", true)
// 	await delay(500)
// 	myClient.command("pippo", "add")
// 	myClient.command("pippo", "add")
// 	myClient.command("pippo", "remove")
// 	myClient.command("pippo", "add")
// 	myClient.update()

// 	await delay(200)
// 	myServer.update()
// 	await delay(200)
// 	myServer.update()
// 	await delay(500)

// 	expect(myServer.objects["pippo"].value).toEqual([
// 		"add row version 1",
// 		"add row version 4",
// 	])
// 	expect(myClient.objects["pippo"].value).toEqual([
// 		"add row version 1",
// 		"add row version 4",
// 	])
// }, 100000)



test("send actions", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()

	myServer.onSend = async (client, message) => {
		(<ClientObjects>client).receive(JSON.stringify(message))
	}
	myServer.apply = ApplyAction
	myClient.onSend = async (message) => {
		myServer.receive(JSON.stringify(message), myClient)
	}
	myClient.apply = ApplyAction

	await myClient.init("pippo", true)
	myClient.command("pippo", "add")
	myClient.command("pippo", "add")
	myClient.update()
	myClient.command("pippo", "remove")
	myClient.command("pippo", "add")


	// simulo la disconnessione
	myServer.disconnect(myClient)
	await delay(200)

	// simulo la riconnessione
	myClient.reset()
	await delay(200)
	myClient.update()
	await delay(200)
	myServer.update()
	await delay(200)
	myServer.update()

	expect(myServer.objects["pippo"].value).toEqual([
		"add row version 1",
		"add row version 4",
	])
	expect(myClient.objects["pippo"].value).toEqual([
		"add row version 1",
		"add row version 4",
	])
}, 100000)


test("send actions 2 client", async () => {
	const myServer = new ServerObjects()
	const myClient1 = new ClientObjects()
	myClient1["name"] = "client1"
	const myClient2 = new ClientObjects()
	myClient2["name"] = "client2"

	// const serverCom = new MemServerComunication(myServer)
	// const clientCom1 = new MemClientComunication(myClient1, serverCom)
	// const clientCom2 = new MemClientComunication(myClient2, serverCom)
	myServer.onSend = async (client, message) => {
		(<ClientObjects>client).receive(JSON.stringify(message))
	}
	myClient1.onSend = async (message) => {
		myServer.receive(JSON.stringify(message), myClient1)
	}
	myClient2.onSend = async (message) => {
		myServer.receive(JSON.stringify(message), myClient2)
	}


	myClient1.observe("pippo", (data) => {
		console.log("client1", data)
	})
	myClient2.observe("pippo", (data) => {
		console.log("client2", data)
	})

	myClient1.init("pippo")
	await delay(500)

	myClient1.command("pippo", "add")
	await delay(200)
	myClient2.init("pippo")
	myClient1.command("pippo", "add")

	await delay(200)
	myServer.update()
	await delay(500)
	myServer.update()
	await delay(1000)

	expect(myServer.objects["pippo"].value).toEqual([
		"add row version 1",
		"add row version 2",
	])
	expect(myClient1.objects["pippo"].value).toEqual([
		"add row version 1",
		"add row version 2",
	])
	expect(myClient2.objects["pippo"].value).toEqual([
		"add row version 1",
		"add row version 2",
	])
}, 100000)

test("init and fast update sync", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()
	myServer.onSend = async (client, message) => {
		(<ClientObjects>client).receive(JSON.stringify(message))
	}
	myClient.onSend = async (message) => {
		myServer.receive(JSON.stringify(message), myClient)
	}
	// const serverCom = new MemServerComunication(myServer)
	// const clientCom = new MemClientComunication(myClient, serverCom)

	await myClient.init("pippo")
	myClient.command("pippo", "add")

	await delay(500)
	myServer.update()
	await delay(500)

	expect(myClient.objects["pippo"].value).toEqual([
		"add row version 1",
	])
})

