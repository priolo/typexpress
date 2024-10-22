import { ServiceBase } from "../../core/service/ServiceBase.js"
import { PathFinder } from "../../core/path/PathFinder.js"
import { RootService } from "../../core/RootService.js"
import * as http from "../http/index.js"
import { ConfActions } from "../../core/node/utils.js"



class TestService extends ServiceBase {
	get prop() { return 54 }
}

let root: RootService

beforeAll(async () => {
	root = await RootService.Start([
		// string: internal name
		{ class: "http", port: 123 },
		// class: class to istantiate
		{ class: TestService, name: "test" },
		// string: relative path
		//{ class: `./JestTestService.ts`, name: "test2" },
		{ class: `farm/test`, name: "test3" }
	])
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("su creazione", async () => {
	const http: http.Service = PathFinder.Get(root, "/http")
	expect(http.state.port).toBe(123)
	const test: TestService = PathFinder.Get(root, "/test")
	expect(test.prop).toBe(54)
	//const test2: TestService = PathFinder.Get(root, "/test2")
	//expect(test2.prop).toBe(66)
	const test3: TestService = PathFinder.Get(root, "/test3")
	expect(test3.prop).toBe(66)
})