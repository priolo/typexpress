import { ServiceBase, ServiceBaseActions, IEvent, ServiceBaseEvents } from "../service"
import { PathFinder } from "../../core/path/PathFinder"
import { RootService } from "../../core/RootService"
import { Bus } from "../../core/path/Bus"


let root = null

beforeAll(async () => {
	root = await RootService.Start({
		name: "root",
		children: [
			{
				name: "child1",
				children: [
					{ name: "child1.1" },
					{
						name: "receiver",
						class: class extends ServiceBase {
							protected onEvent(payload: IEvent): void {
								if (payload.name != ServiceBaseEvents.STATE_CHANGE ) return
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
		]
	})
})

afterAll(async () => {
	RootService.Stop(root)
})

test("register", async () => {
	const emitter = new PathFinder(root).getNode<ServiceBase>("/root/child2/emitter")
	const receiver = new PathFinder(root).getNode<ServiceBase>("/root/child1/receiver")

	new Bus(receiver, "/root/child2/emitter").dispatch({
		type: ServiceBaseActions.REGISTER,
		payload: ServiceBaseEvents.STATE_CHANGE,
	})

	emitter.setState({ value: "pippo" })
	expect(receiver.state.value).toBe("pippo")

})