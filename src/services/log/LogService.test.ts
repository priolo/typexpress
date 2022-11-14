/**
 * @jest-environment node
 */
import { log as logNs, RootService, PathFinder } from "../../index"

let root = null


beforeEach(async () => {

	root = await RootService.Start([
		{
			class: "log",
			children: [
				{
					class: "file",
					filename: "pippo.log"
				}
			]
		},
	])
})

afterAll(async () => {
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
	
})
