import { RootService } from "../../core/RootService.js"
import { NodeState } from "../node/NodeState.js"
import { EventsLogsBase, ILog } from "../node/types.js"
import { ServiceBase } from "../service/ServiceBase.js"
import { findNodeByPath } from "../utils.js"



let root: RootService

describe('ServiceBase', () => {
	beforeAll(async () => {
		root = await RootService.Start([
			{
				name: "child1",
				children: [
					{ name: "child1.1" },
					{ name: "receiver" },
				]
			},
			{
				name: "child2",
				children: [
					{
						value: "uno",
						name: "emitter",
						class: ServiceBase,
					}
				]
			}
		])
	})

	afterAll(async () => {
		RootService.Stop(root)
	})

	test("register", async () => {
		const nodeEmitter = findNodeByPath<NodeState>(root, "/child2/emitter")
		const nodeReceiver = findNodeByPath<NodeState>(root, "/child1/receiver")

		root.emitter.on(EventsLogsBase.STATE_CHANGE, (msg) => {
			const log = msg.payload as ILog
			if (log.source == "/child2/emitter") nodeReceiver?.setState({ value: log.payload.value })
		})

		nodeEmitter?.setState({ value: "pippo" })
		expect(nodeReceiver?.state.value).toBe("pippo")
	})
})