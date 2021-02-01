import { RootService } from "../../core/RootService"
import { ConfActions, NodeConf } from "../node/NodeConf"


test("set state and build", async () => {
	const root = new RootService("root")
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
	expect(root.name).toBe("root2")
	expect(root.state.value).toBe(23)
	expect(root.children.map(c => c.name)).toContain("child1")
	expect(root.children
		.find(c => c.name == "child1")?.children
		.map(c => c.name)
	).toContain("child1.2")
})

test("inheritance of config", async () => {
	class NodeA extends NodeConf {
		get defaultConfig():any { return { ...super.defaultConfig,
			propA: "A", propOver: "A", propOver2: "A"
		}}
	}
	class NodeB extends NodeA {
		get defaultConfig():any { return { ...super.defaultConfig,
			propB: "B", propOver: "B", propOver2: "B"
		}}
	}
	const root = new RootService("root")
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			prop: "X",
			children: [
				{
					name: "nodeB",
					class: NodeB,
					propOver2: "B2"
				}
			]
		}
	})
	const node = <NodeB>root.children[1]
	expect(root.state.prop).toBe("X")
	expect(node.state.propA).toBe("A")
	expect(node.state.propB).toBe("B")
	expect(node.state.propOver).toBe("B")
	expect(node.state.propOver2).toBe("B2")
})

