import { RootService } from "../RootService"
import { ConfActions } from "../node/NodeConf"
import { nodeToJson, nodeMap } from "../utils"


let root;

beforeAll(async () => {
	root = new RootService("root")
	await root.dispatch({
		type: ConfActions.START,
		payload: {
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
		}
	})
})


test("nodeToJson", async () => {

	const json = nodeToJson(root)

	expect(json).toEqual( {
		name: "root2",
		//value: 23,
		children: [
			{
				name: "farm",
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
	} )
})

test("nodeMap", async () => {

	const json = nodeMap (root, (n,children)=>({
		nome:n.name,
		figli:children(),
	}))

	expect(json).toEqual( {
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
	} )
})

