import { RootService } from "../RootService"
import { PathFinder } from "../path/PathFinder"
import { NodeConf } from "../node/NodeConf"
import { ConfActions } from "../node/utils"


let root;

class Test extends NodeConf {
	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "test",
			value: "custom"
		}
	}
}


beforeAll(async () => {
	root = new RootService("root")
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			name: "root2",
			value: 23,
			children: [
				{
					value: 55,
					name: "child1",
					children: [
						{ name: "child1.1" },
						{ name: "child1.2" },
						{ 
							name: "child1.3",
							value: "pippo",
							children: [
								{ name: "child1.3.1" },
								{ name: "child1.3.2" }
							]
						}
					]
				},
				{
					name: "child2",
					children: [
						{ name: "child2.1" },
						{
							class: Test,
						}
					]
				}
			]
		}
	})
})

test("regular path", async () => {
	let path = new PathFinder(root).path("/child2/child2.1")
	expect(path?.node.name).toBe( "child2.1" )
	let path2 = path?.path("..")
	expect(path2?.node.name).toBe( "child2" )
	let node = path2?.getNode<any>("/child1")
	expect(node?.name).toBe( "child1" )
})

test("find by id", async () => {
	let node1 = new PathFinder(root).path("/child2/child2.1").node
	let node2 = new PathFinder(root).path(`/child2/*${node1.id}`).node
	expect(node1).toBe(node2 )
})

test("find deep", async () => {
	let node = new PathFinder(root).getNode<any>("/>child2.1")
	expect(node).toBeDefined()
	node = new PathFinder(root).getNode<any>(`/>*${node.id}`)
	expect(node).toBeDefined()
})

test("find by state", async () => {
	let node = new PathFinder(root).getNode<any>('/>{"value":"pippo"}')
	expect(node.name).toBe("child1.3")
	node = new PathFinder(root).getNode<any>('/{"value":55}/child1.2')
	expect(node.name).toBe("child1.2")
})

test("find by class", async () => {
	const node = new PathFinder(root).getNode<any>('/>~Test')
	expect(node.state.value).toBe("custom")
})

test("find parent", async () => {
	const node = new PathFinder(root).getNode<any>("/>child1.3.1")
	expect(node.name).toBe("child1.3.1")
	const nodeRes = new PathFinder(node).getNode<any>('<{"value":55}')
	expect(nodeRes.name).toBe("child1")
})