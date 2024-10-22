import { NodeState } from "../node/NodeState.js"
import { time } from "@priolo/jon-utils"


type F = {
	[key: string]: (param: any) => void
}

describe("NODE STATE", () => {

	/**
	I NODEs `NodesStyate` posso avere uno STATE interno
	che puo' essere modificato da `setState`
	Questo puo' cambiare solo alcune proprietà (internamente fa un merge)
	ma l'instanza dell'oggetto "state" cambia sempre
	> NOTA: Non possiamo creare direttamente NodeState perche' è "abstract"
	 */
	test("set state", async ()=> {

		// estendo e instanzio NodeState
		const node = new class extends NodeState {
			protected _state = {
				value1: "init value1",
				value2: "init value2"
			}
		}
		expect(node.state).toMatchObject({
			value1: "init value1",
			value2: "init value2"
		})

		// NOTA: modifico solo la proprietà "value2"
		node.setState( { value2: "modify value2"} )
		expect(node.state).toMatchObject({
			value1: "init value1",
			value2: "modify value2"
		})
	})

	/**
	Inoltre posso definire un set (`dispatchMap`) di `dispatcher`  
	Questi `dispatcher` solitamente sono funzioni pure e applicano delle modifiche allo `state`  
	 */
	test("call dispatch", async () => {

		// definisco la KEY delle ACTIONs (opzionale)
		const MY_ACTIONS = {
			SET_STATE: "set_state",
			SET_STATE_ASYNC: "set_state_async",
		}

		// estendo e instanzio NodeState
		const myNode = new class extends NodeState {

			// qua sono definite le ACTIONs
			get dispatchMap(): any {
				return {

					// questa riga serve se si vogliono ereditare i "dispatcher" dal "parent"
					// (in questo caso non eredita nulla da `NodeState`)
					...super.dispatchMap,

					// questa è semplicemente una funzione che setta un valore al NODE
					[MY_ACTIONS.SET_STATE]: (state, payload: any) => {
						this.setState(payload)
						return "ok-1"
					},

					// i `dispatcher` possono essere anche asincroni
					[MY_ACTIONS.SET_STATE_ASYNC]: async (state, payload: any) => {
						await time.delay(10)
						this.setState(payload)
						return "ok-2"
					}
				}
			}
		}

		// chiamo il `dispatch` con nome `set_state1` e gli passo un `payload`
		let ret = myNode.dispatch({
			type: MY_ACTIONS.SET_STATE,
			payload: { val: 1 }
		})
		expect(ret).toEqual("ok-1")

		// chiamo il `dispatch` asincrono
		ret = await myNode.dispatch({
			type: MY_ACTIONS.SET_STATE_ASYNC,
			payload: { val2: 2 }
		})
		expect(ret).toEqual("ok-2")

		// a questo punto lo `state` dovrebbe essere così
		expect(myNode.state).toEqual({ val: 1, val2: 2 })
	})

})