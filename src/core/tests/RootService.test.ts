import { RootService } from "../RootService"

test("su creazione", () => {
	const node = new RootService()
	expect(node.children[0].name).toBe("farm")
	expect(node.name).toBe("root")	
})