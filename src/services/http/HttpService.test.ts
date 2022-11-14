import { getFreePort } from "../ws"
import { PathFinder, RootService } from "../../index"
import HttpService from "./index"


test("su creazione", async () => {
	const PORT = await getFreePort()


	/**
	 * Per creare un HttpService si puo' utilizzare il  "classico" name sul NODE
	 * il name dell'HttpService è `http`
	 */
	const root = await RootService.Start(
		{ class: "http", port: PORT }
	)

	// infatti lo cerco e lo trovo
	const http = new PathFinder(root).getNode<HttpService>("/http")
	expect(http instanceof HttpService).toBeTruthy()
	expect(http.state.port).toBe(PORT)

	await RootService.Stop(root)
})