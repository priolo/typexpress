import { INode } from "../node/INode.js";
import { NodeConf } from "../node/NodeConf.js";
import { PathFinder } from "../path/PathFinder.js";
import { nodeMap, nodePath, nodeToJson } from "../utils.js";



let root: NodeConf;

beforeAll(async () => {
	debugger
	root = new NodeConf()
	root.buildByJson({
		// sovrascrivo "root" con "root2"
		name: "root2",
		value: 23,
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

test("nodeToJson", async () => {
debugger
	const json = nodeToJson(root)

	expect(json).toEqual({
		name: "root2",
		//value: 23,
		children: [
			{
				name: "farm",
				children: [],
			},
			{
				name: "error",
				children: [],
			},
			{
				name: "child1",
				children: [
					{ name: "child1.1", children: [] },
					{ name: "child1.2", children: [] }
				]
			},
			{
				name: "child2",
				children: [
					{ name: "child2.1", children: [] }
				]
			}
		]
	})
})

test("nodeMap", async () => {

	const json = nodeMap(root, (n, children) => ({
		nome: n.name,
		figli: children(),
	}))

	expect(json).toEqual({
		nome: "root2",
		//value: 23,
		figli: [
			{
				nome: "farm",
				figli: [],
			},
			{
				nome: "error",
				figli: [],
			},
			{
				nome: "child1",
				figli: [
					{ nome: "child1.1", figli: [] },
					{ nome: "child1.2", figli: [] }
				]
			},
			{
				nome: "child2",
				figli: [
					{ nome: "child2.1", figli: [] }
				]
			}
		]
	})
})

test("nodePath", async () => {
	const pathFind = "/child1/child1.2"
	const node = new PathFinder(root).getNode<INode>(pathFind)
	const path = nodePath(node)
	expect(path).toBe(pathFind)
})

