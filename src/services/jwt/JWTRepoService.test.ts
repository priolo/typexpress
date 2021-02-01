import fs from "fs"
import { RootService } from "../../core/RootService"
import { PathFinder } from "../../core/path/PathFinder";
import { ConfActions } from "../../core/node/NodeConf";
import {JWTActions, JWTRepoService} from "./JWTRepoService";


test("su creazione", async () => {

	const root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "jwt",
					secret: "secret_word!!!"
				}
			]
		}
	})

	const jwt = new PathFinder(root).getNode<JWTRepoService>("/jwt")
	expect(jwt instanceof JWTRepoService).toBeTruthy()

	const str = "test"

	const token = await jwt.dispatch({
		type: JWTActions.ENCODE,
		payload: str
	})

	const str2 = await jwt.dispatch({
		type: JWTActions.DECODE,
		payload: token
	})

	expect(str).toBe(str2)

	await root.dispatch({ type: ConfActions.STOP })
})