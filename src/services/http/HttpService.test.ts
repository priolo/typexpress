import { getFreePort } from "../ws"
import { PathFinder } from "../../core/path/PathFinder"
import { RootService } from "../../core/RootService"
import HttpService from "./index"


test("su creazione", async () => {
	const PORT = await getFreePort()
	const root = await RootService.Start(
		{ class: "http", port: PORT }
	)

	const http = new PathFinder(root).getNode<HttpService>("/http")
	expect(http instanceof HttpService).toBeTruthy()
	expect(http.state.port).toBe(PORT)

	await RootService.Stop(root)
})