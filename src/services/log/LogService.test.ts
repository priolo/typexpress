import { PathFinder, RootService, log as logNs } from "../../index.js"
import LogService, { LogConf } from "./LogService.js"
import { Actions, LogLevel } from "./utils.js"



let root: RootService | null = null

beforeEach(async () => {

	root = await RootService.Start([
		<LogConf>{
			class: "log",
			children: [
				<ConsoleConf>{
					class: "log/console",
				}
			]
		},
		<LogConf>{
			name: "logbase",
			class: "log",
		},
	])
})

afterAll(async () => {
	if (!root) return
	await RootService.Stop(root)
})

/**

 */
test("creazione", async () => {
	/**
	 * E' possibile quindi chiamare questo servizio e generare dei log
	 * in base ai `LogTransportService` definiti come children  
	 */
	// Quindi posso prelevare il SERVICE con il `PathFinder`
	// in questo caso la `path` è "/log"
	const log = new PathFinder(root).getNode<logNs.Service>("/log")
	expect(log instanceof logNs.Service).toBeTruthy()

})

test("log", async () => {
	// ottenuto il servizio...
	const log = new PathFinder(root).getNode<logNs.Service>("/log")
	// ...quindi posso generare un log
	log.execute({ type: Actions.LOG, payload: { message: "test log!" } })
})

test("log base", async () => {
	// ottenuto il servizio...
	const log = new PathFinder(root).getNode<logNs.Service>("/logbase")
	// ...quindi posso generare un log
	log.execute({ type: Actions.LOG, payload: { level: LogLevel.WARN,  message: "test log!" } })
})

test("log base without level", async () => {
	// sent directly a message
	LogService.Send(root, "another log")
})
