import { NodeState } from "../node/NodeState"
import {delay} from "../../utils/timer"


type F = {
	[key:string]:(param:any) => void
}

class NodeTest extends NodeState {
	get dispatchMap():any { return {
		...super.dispatchMap,
		set_state1: (state, payload:any)=>{
			this.setState(payload)
			return "ok-1"
		},
		set_state2: async (state, payload:any)=>{
			await delay(10)
			this.setState(payload)
			return "ok-2"
		}
	}}
}

test("set state", async () => {
	const node = new NodeTest("root")
	let ret = await node.dispatch ( { 
		type:"set_state1", 
		payload: { val: 1} 
	} )
	expect(ret).toEqual( "ok-1" )
	ret = await node.dispatch ( { 
		type:"set_state2", 
		payload: { val2: 2} 
	} )
	expect(ret).toEqual( "ok-2" )
	expect(node.state).toEqual( { val: 1, val2:2 } )
})

