import { ServiceBase } from "../../core/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder"
import { RootService } from "../../core/RootService"
import { HttpService } from "../http/HttpService"
import { ConfActions } from "../../core/node/NodeConf"

class TestService extends ServiceBase {
	get prop() { return 54 }
}

test("su creazione", async () => {
	const root = new RootService()
	await root.dispatch( {
		type: ConfActions.START,
		payload: {
			children: [
				// string: internal name
				{ class: "http", port: 123 },
				// class: class to istantiate
				{ class: TestService, name: "test" },
				// string: relative path
				{ class: `./JestTestService`, name: "test2" },
				{ class: `farm/test`, name: "test3" }
			]
		}
	})

	const http = new PathFinder(root).getNode<HttpService>("/http")
	expect(http.state.port).toBe(123)	
	const test = new PathFinder(root).getNode<TestService>("/test")
	expect(test.prop).toBe(54)
	const test2 = new PathFinder(root).getNode<TestService>("/test2")
	expect(test2.prop).toBe(66)
	const test3 = new PathFinder(root).getNode<TestService>("/test3")
	expect(test3.prop).toBe(66)

	await root.dispatch( { type: ConfActions.STOP })
})