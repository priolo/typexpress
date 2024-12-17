import { PathFinder } from "../../../core/path/PathFinder.js"
import { RootService } from "../../../core/RootService.js"
import { ServiceBaseEvents } from "../../../core/service/index.js"

//import EmailService, { Actions, IAccount, IEmail } from "../index.js"
import * as emailNs from "../index.js"


let root:RootService

beforeEach(async () => {
	root = await RootService.Start({
		class: "email",
		account: <emailNs.IAccount>{
			// https://ethereal.email/login
			host: 'smtp.ethereal.email',
			port: 587,
			auth: {
				user: 'kariane.ortiz@ethereal.email',
				pass: 'uSpxTR8bb3Egha5jk7'
			}
		},
	})
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("invio email", async () => {
	const email = new PathFinder(root).getNode<emailNs.Service>("/email")
	expect(email).toBeInstanceOf(emailNs.Service)

	let res = false


	// intanto intercetto l'EVENT
	email.emitter.once(ServiceBaseEvents.DISPATCH, (action) => {
		res = true
	})
	// invio l'email
	await email.execute({
		type: emailNs.Actions.SEND,
		payload: <emailNs.IEmail>{
			from: "from@test.com",
			to: "to@test.com",
			subject: "this is a test!",
			text: "Congratz! test success",
		}
	})
	// per il momento tocca controllare all'indirizzo:
	// https://ethereal.email/messages
	expect(res).toBeTruthy()


	// controllo esista un email
	res = await email.execute({
		type: emailNs.Actions.CHECK,
		payload: "iorioivano@gmail.com"
	})
	expect(res).toBeTruthy()


	// controllo esista un email
	res = await email.execute({
		type: emailNs.Actions.CHECK,
		payload: "pippojksdfhlghsjkfsd@gmail.com"
	})
	expect(res).toBeFalsy()
})