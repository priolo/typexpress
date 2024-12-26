import {  ServiceBaseLogs, IChildLog } from "../service/utils.js"
import { ServiceBase } from "../service/ServiceBase.js"
import { PathFinder } from "../../core/path/PathFinder.js"
import { RootService } from "../../core/RootService.js"
import { Bus } from "../../core/path/Bus.js"



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
							protected onInit(): Promise<void> {
								PathFinder.Get<RootService>(this, "/").emitter.on(ServiceBaseLogs.STATE_CHANGE, (log: IChildLog) => {
									if (log.source == "/child2/emitter") this.setState(log.payload )
								})
								return super.onInit()
							}
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

		// await new Bus(receiver, "/child2/emitter").dispatch({
		// 	type: ServiceBaseActions.REGISTER,
		// 	payload: ServiceBaseEvents.STATE_CHANGE,
		// })

		nodeEmitter.setState({ value: "pippo" })
		expect(nodeReceiver.state.value).toBe("pippo")
	})
})