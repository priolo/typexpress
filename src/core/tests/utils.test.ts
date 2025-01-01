import FarmService from "../../services/farm/FarmService.js";
import { INode } from "../node/INode.js";
import { NodeConf } from "../node/NodeConf.js";
import { PathFinder } from "../path/PathFinder.js";
import { nodeMap, nodePath, nodeToJson, nodeToStruct } from "../utils.js";



let root: NodeConf;

describe("CORE UTILS", () => {

	beforeAll(async () => {
		root = new NodeConf()
		root.addChild(new FarmService())
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
		const json = nodeToStruct(root)

		expect(json).toMatchObject({
			name: "root2",
			//value: 23,
			children: [
				{ name: "farm" },
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

})