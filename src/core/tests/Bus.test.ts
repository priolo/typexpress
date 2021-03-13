import { Bus } from "../path/Bus"
import FarmService from "../../services/farm"
import { ConfActions, NodeConf } from "../node/NodeConf"



let root = null
class TestNode extends NodeConf {
	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			SetState: async (state, payload) => {
				await this.setState({value:payload})
				return "pluto"
			},
		}
	}
}



beforeAll(async () => {
	root = new NodeConf("root")
	root.addChild(new FarmService())
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
						{ 
							class: TestNode,
							name: "child1.2",
							value: "pippo" 
						}
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

afterAll(async () => {
	root.dispatch( { type: ConfActions.STOP })
})


test("setup", async () => {
	const node = root.children.find( n => n.name=="child1" )?.children.find( n => n.name == "child1.2" )
	expect(node).toBeInstanceOf(TestNode)
})

test ("send action", async () => {
	const ret = await new Bus(root, "/child1/child1.2").dispatch({
		type: "SetState",
		payload: "topolino",
	})
	expect(ret).toBe("pluto")
	const node = root.children.find( n => n.name=="child1" )?.children.find( n => n.name == "child1.2" )
	expect(node.state.value).toBe("topolino")
})

