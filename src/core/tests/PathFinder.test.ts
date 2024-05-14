import { RootService } from "../RootService"
import { PathFinder } from "../path/PathFinder"
import { NodeConf } from "../node/NodeConf"
import { ConfActions } from "../node/utils"


describe("PathFinder", () => {

	let root;

	// creiamo priuma di tutto una struttura su cui "esercitarci"
	beforeAll(async () => {

		class Test extends NodeConf {
			get stateDefault(): any {
				return {
					...super.stateDefault,
					name: "test",
					value: "custom"
				}
			}
		}

		root = await RootService.Start({
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
								{ name: "child1.3.1", value: "sigma" },
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
		})
	})

	test("regular path", async () => {
		let path = new PathFinder(root).path("/child2/child2.1")
		expect(path?.node.name).toBe("child2.1")
		let path2 = path?.path("..")
		expect(path2?.node.name).toBe("child2")
		let node = path2?.getNode<any>("/child1")
		expect(node?.name).toBe("child1")
	})

	test("find by id", async () => {
		let node1 = new PathFinder(root).path("/child2/child2.1").node
		let node2 = new PathFinder(root).path(`/child2/*${node1.id}`).node
		expect(node1).toBe(node2)
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

		// trova il parent in base ad un pattern di ricerca
		let nodeRes = new PathFinder(node).getNode<any>('<{"value":55}')
		expect(nodeRes.name).toBe("child1")
		// se non lo trova restituisce udefined
		nodeRes = new PathFinder(node).getNode<any>('<{"value":123}')
		expect(nodeRes).toBeUndefined()
		// puo' essere anche il nodo stesso 
		nodeRes = new PathFinder(node).getNode<any>('<{"value":"sigma"}')
		expect(nodeRes).toBe(node)

		// cerco un parent che abbia il nodo cercato tra i children
		//nodeRes = new PathFinder(node).getNode<any>('^child1.2')
		//expect(nodeRes).toBe(node)

		// prendo la root
		nodeRes = new PathFinder(node).getNode<any>('/')
		expect(nodeRes).toBe(root)
	})

})