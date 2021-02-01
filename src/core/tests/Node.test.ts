import { Node } from "../node/Node"

test("creation", () => {
	const root = new Node("root")
	expect(root.children.length == 0).toBe(true)
})


test("add child", () => {
	const root = new Node("root")
	const child1 = new Node("child1")
	child1.addChild ( new Node("child1.1"))
	child1.addChild ( new Node("child1.2"))
	root.addChild ( child1 )
	root.addChild ( new Node("child2"))

	expect(root.children.length == 2).toBe(true)
	expect(child1.children.length == 2).toBe(true)
	const node1_2 = root.children
		.find(n=>n.name=="child1")?.children
		.find(n=>n.name=="child1.2")
	expect(node1_2).not.toBeNull()
})

test("remove child", () => {
	const root = new Node("root")
	root.addChild ( new Node("child1"))
	root.addChild ( new Node("child2"))
	root.addChild ( new Node("child3"))
	expect(root.children.length == 3).toBe(true)
	root.removeChild(1)
	expect(root.children.length == 2).toBe(true)
})