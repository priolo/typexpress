import { ServerObjects } from "../ServerObjects"
import { ClientObjects } from "../ClientObjects"
import { MemClientComunication } from "../comunicators/MemClientComunication"
import { MemServerComunication } from "../comunicators/MemServerComunication"
import { delay } from "../utils"



beforeAll(async () => {
})

afterAll(async () => {
})

test("send actions", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()

	const serverCom = new MemServerComunication(myServer)
	const clientCom = new MemClientComunication(myClient, serverCom)

	myClient.observe("pippo", (data) => {
		console.log(data)
	})

	await clientCom.requestInit("pippo")

	await delay(500)

	clientCom.requestCommand("pippo", "add")
	clientCom.requestCommand("pippo", "add")
	clientCom.requestCommand("pippo", "remove")
	clientCom.requestCommand("pippo", "add")

	await delay(200)
	myServer.updateToClient(serverCom)
	await delay(200)
	myServer.updateToClient(serverCom)
	await delay(500)
	myServer.updateToClient(serverCom)

	await delay(1000)

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

	const serverCom = new MemServerComunication(myServer)
	const clientCom1 = new MemClientComunication(myClient1, serverCom)
	const clientCom2 = new MemClientComunication(myClient2, serverCom)
	
	myClient1.observe("pippo", (data) => {
		console.log("client1", data)
	})
	myClient2.observe("pippo", (data) => {
		console.log("client2", data)
	})

	clientCom1.requestInit("pippo")
	await delay(500)

	clientCom1.requestCommand("pippo", "add")
	await delay(200)
	clientCom2.requestInit("pippo")
	clientCom1.requestCommand("pippo", "add")

	await delay(200)
	myServer.updateToClient(serverCom)
	await delay(500)
	myServer.updateToClient(serverCom)
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


test("init and fast update throw error", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()

	const serverCom = new MemServerComunication(myServer)
	const clientCom = new MemClientComunication(myClient, serverCom)
	
	clientCom.requestInit("pippo")
	let error = false
	try {
		clientCom.requestCommand("pippo", "add")
	} catch (e) {
		error = true
	}

	expect(error).toBe(true)
})


test("init and fast update sync", async () => {
	const myServer = new ServerObjects()
	const myClient = new ClientObjects()

	const serverCom = new MemServerComunication(myServer)
	const clientCom = new MemClientComunication(myClient, serverCom)
	
	await clientCom.requestInit("pippo")
	clientCom.requestCommand("pippo", "add")

	await delay(500)
	myServer.updateToClient(serverCom)
	await delay(500)

	expect(myClient.objects["pippo"].value).toEqual([
		"add row version 1",
	])
})





