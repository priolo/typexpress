/**
 * @jest-environment node
 */
import { Bus } from "../../../core/path/Bus"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import PushNotificationService, { PushNotificationActions } from "../PushNotificationService"
import { nodeToJson } from "../../../core/utils"
import path from "path"


let root = null
const pathAutentication = path.join(__dirname, "../../../../extreme-citadel-739-firebase-adminsdk-9re8d-24e3027953.json")

beforeAll(async () => {
	root = await RootService.Start(
		{
			class: "push",
			credential: require(pathAutentication),
		}
	)
})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const node = new PathFinder(root).getNode<PushNotificationService>("/push")
	// console.log(nodeToJson(node))
	expect(node).toBeInstanceOf(PushNotificationService)
})

test("send notification", async () => {

	const messageId = await new Bus(root, "/push").dispatch({
		type: PushNotificationActions.SEND,
		payload: {
			token: "fbOYl4cnQb6SAWErSeosfM:APA91bEDh8eaNh8Pc22g0drfAvf9afGOU39yXxbbFCqlxtl5Nz9sd6zXc4z1CKYSfHTGzK7ExcbrpDwAYnz5GmxWY5-sGv36Kb4KLqBSylDj7r5PLAfJgK4tMdpeDQO02IrWmBr2K0Sm",
			notification: { body: "messaggio" }
		},
	})

	console.log( messageId ) 

})