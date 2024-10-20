import { getFreePort } from "../ws"
import { PathFinder, RootService, ServiceBase } from "../../index"
import HttpService from "./index"

describe("HTTP SERVICE", () => {

	let PORT = 0
	let root:RootService = null

	beforeAll( async ()=>{
		PORT = await getFreePort()
	})

	test("su creazione", async () => {

		/**
		 * Per creare un HttpService si puo' utilizzare il  "classico" name sul NODE
		 * per `HttpService` è `http`
		 */
		root = await RootService.Start(
			{ class: "http", port: PORT }
		)

		// quindi qui ho il `RootService` con un solo `child` di tipo `http`
		// aperto su una porta libera.
		// infatti lo cerco e lo trovo
		const http = new PathFinder(root).getNode<HttpService>("/http")
		expect(http instanceof HttpService).toBeTruthy()
		expect(http.state.port).toBe(PORT)

		// quando chiudo il `RootService` anche il server si chiude (naturalmente)
		await RootService.Stop(root)

		// naturalmente un server del genere non serve a nulla 
		// se non si inseriscono dei `route` al suo interno
		// E' quello che fa `http-route`
	})

})