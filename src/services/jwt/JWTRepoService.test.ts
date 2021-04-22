import fs from "fs"
import { RootService } from "../../core/RootService"
import { PathFinder } from "../../core/path/PathFinder";
import { ConfActions } from "../../core/node/NodeConf";
import { JWTActions, JWTRepoService } from "./JWTRepoService";


test("su creazione", async () => {

	const root = await RootService.Start({
		class: "jwt",
		secret: "secret_word!!!"
	})

	const jwt = new PathFinder(root).getNode<JWTRepoService>("/jwt")
	expect(jwt instanceof JWTRepoService).toBeTruthy()

	const str = "test"

	const token = await jwt.dispatch({
		type: JWTActions.ENCODE,
		payload: { payload: str }
	})

	const str2 = await jwt.dispatch({
		type: JWTActions.DECODE,
		payload: token
	})

	expect(str).toBe(str2)

	await RootService.Stop(root)
})