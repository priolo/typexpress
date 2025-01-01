import { PathFinder } from "../../core/path/PathFinder.js"
import { RootService } from "../../core/RootService.js"
import { EventsLogsBase, ILog } from "../node/types.js"
import { ServiceBase } from "../service/ServiceBase.js"



let root: RootService

describe('ServiceBase', () => {
	beforeAll(async () => {
		root = await RootService.Start([
			{
				name: "child1",
				children: [
					{ name: "child1.1" },
					{
						name: "receiver",
						class: class extends ServiceBase {
							// protected onInit(): Promise<void> {
							// 	PathFinder.Get<RootService>(this, "/").emitter.on(ServiceBaseLogs.STATE_CHANGE, (log: IChildLog) => {
							// 		if (log.source == "/child2/emitter") this.setState(log.payload )
							// 	})
							// 	return super.onInit()
							// }
						}
					}
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
		const nodeEmitter = new PathFinder(root).getNode<ServiceBase>("/child2/emitter")
		const nodeReceiver = new PathFinder(root).getNode<ServiceBase>("/child1/receiver")

		root.emitter.on(EventsLogsBase.STATE_CHANGE, (log: ILog) => {
			if (log.source == "/child2/emitter") nodeReceiver.setState({ value: log.payload.value })
		})

		nodeEmitter.setState({ value: "pippo" })
		expect(nodeReceiver.state.value).toBe("pippo")
	})
})