import { Bus } from "../../../core/path/Bus.js"
import { PathFinder } from "../../../core/path/PathFinder.js"
import { RootService } from "../../../core/RootService.js"
import * as push from "../index.js"
import path from "path"
import { fileURLToPath } from 'url';


/*
key per SDK FIREBASE
https://console.firebase.google.com/u/0/project/extreme-citadel-739/settings/serviceaccounts/adminsdk
admin progetto
https://console.cloud.google.com/iam-admin/iam?authuser=0&folder=&organizationId=&project=extreme-citadel-739
*/


const __dirname = path.dirname(fileURLToPath(import.meta.url));
let root:RootService
const pathAutentication = path.join(__dirname, "../../../../extreme-citadel-739-firebase-adminsdk-9re8d-2a0bd23afd.json")

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
	const node = new PathFinder(root).getNode<push.Service>("/push")
	// console.log(nodeToJson(node))
	expect(node).toBeInstanceOf(push.Service)
})

test("send notification", async () => {

	// const messageId = await new Bus(root, "/push").dispatch({
	// 	type: PushNotificationActions.SEND,
	// 	payload: {
	// 		token: "eV7vosX7RaKAQo_a72jTcS:APA91bElESXDC_yWOfSGpp-YULjoMC8SfnriOC7_4fciohThzjhdWV_Z598ygxdvUlpC2gEo11hkIAw9GJoS69f0gbUw3U2e9sOSc9pLz51HNtWpy8ygMvdT1EBtIoxgQFLl3KN_rmSf",
	// 		notification: { body: "messaggio" },
	// 	},
	// })
	// expect(messageId).toMatch("projects/extreme-citadel-739/messages")

	const message = {
		data: { score: '850'},
		topic: 'highScores',
	}
	const messageId = await new Bus(root, "/push").dispatch({
		type: push.Actions.SEND,
		payload: message,
	})
	expect(messageId).toMatch("projects/extreme-citadel-739/messages")
})