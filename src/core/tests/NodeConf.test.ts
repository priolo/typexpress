import FarmService from "../../services/farm"
import { NodeConf } from "../node/NodeConf"
import { ConfActions } from "../node/utils"

/**
L'implementazione `NodeState` è un NODE che ha l'`action` CREATE.
Questa `action` permette di creare tutta la struttura dei propri `children`  
tramite un semplice `json`  
Quindi invece di creare i nodi uno a uno per inserirli uno dentro l'altro   
posso usare un solo `json`... in pratica mi facilita il lavoro!
 */

describe("NODE CONF", () => {

	test("Creazione dei children con il json di configurazione", async () => {

		// creo il nodo e ci metto dentro "FarmService" 
		// questo SERVICE permette di creare un NODE da un oggetto di tipo json
		// va messo nel nodo "root"
		const root = new NodeConf("root")
		root.addChild(new FarmService())

		// eseguo l'ACTION CREATE per la generazione dei nodi tramite il PAYLOAD 
		await root.dispatch({
			type: ConfActions.CREATE,
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

		// controllo sia tutto ok
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
			get defaultConfig(): any {
				return {
					...super.defaultConfig,
					propA: "A", propOver: "A", propOver2: "A"
				}
			}
		}
		class NodeB extends NodeA {
			get defaultConfig(): any {
				return {
					...super.defaultConfig,
					propB: "B", propOver: "B", propOver2: "B"
				}
			}
		}
		const root = new NodeConf("root")
		root.addChild(new FarmService())
		await root.dispatch({
			type: ConfActions.CREATE,
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

})