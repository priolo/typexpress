import { ServiceBase } from "../../core/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder"
import { RootService } from "../../core/RootService"
import { HttpService } from "../http/HttpService"
import { EmitterService } from "./EmitterService"
import { ConfActions } from "core/node/NodeConf"
import { EmitterActions } from "./EmitterActions"


let root = null

beforeAll(async () => {
	root = await RootService.Start({
		name: "root",
		children: [
			{
				name: "child1",
				children: [
					{ name: "child1.1" },
					{ name: "child1.2" }
				]
			},
			{
				name: "child2",
				children: [
					{ name: "child2.1" }
				]
			}
		]
	})
})

afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
})

test("su creazione", async () => {
	const emitter = new PathFinder(root).getNode<EmitterService>("/emitter")
	expect(emitter).toBeInstanceOf(EmitterService)
})

test("register", async () => {
	const emitter = new PathFinder(root).getNode<EmitterService>("/emitter")
	emitter.dispatch({
		type: EmitterActions.REGISTER,
		payload: {
			path: "/root/child2",
			event: "state:change",
		}
	})
})