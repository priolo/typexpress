import { ServiceBase, ServiceBaseActions, IEvent, ServiceBaseEvents } from "../service/index.js"
import { PathFinder } from "../../core/path/PathFinder.js"
import { RootService } from "../../core/RootService.js"
import { Bus } from "../../core/path/Bus.js"



let root: RootService

describe('ServiceBase Tests', () => {
	beforeAll(async () => {
		root = await RootService.Start([
			{
				name: "child1",
				children: [
					{ name: "child1.1" },
					{
						name: "receiver",
						class: class extends ServiceBase {
							protected onEvent(payload: IEvent): void {
								if (payload.name != ServiceBaseEvents.STATE_CHANGE) return
								const { value } = payload.arg
								this.setState({ value })
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
		const emitter = new PathFinder(root).getNode<ServiceBase>("/child2/emitter")
		const receiver = new PathFinder(root).getNode<ServiceBase>("/child1/receiver")

		await new Bus(receiver, "/child2/emitter").dispatch({
			type: ServiceBaseActions.REGISTER,
			payload: ServiceBaseEvents.STATE_CHANGE,
		})

		emitter.setState({ value: "pippo" })
		expect(receiver.state.value).toBe("pippo")
	})
})