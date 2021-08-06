import { RootService } from "../../core/RootService"
import { PathFinder } from "../../core/path/PathFinder";
import * as jwtNs from "./index"


test("su creazione", async () => {

	const root = await RootService.Start({
		class: "jwt",
		secret: "secret_word!!!"
	})

	const jwt = new PathFinder(root).getNode<jwtNs.Service>("/jwt")
	expect(jwt instanceof jwtNs.Service).toBeTruthy()

	const str = "test"

	const token = await jwt.dispatch({
		type: jwtNs.Actions.ENCODE,
		payload: { payload: str }
	})

	const str2 = await jwt.dispatch({
		type: jwtNs.Actions.DECODE,
		payload: token
	})

	expect(str).toBe(str2)

	await RootService.Stop(root)
})