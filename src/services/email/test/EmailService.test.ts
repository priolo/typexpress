import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"

import EmailService, { EmailActions, IEmailAccount, IEmail } from "../index"
import { ServiceBaseEvents } from "../../../core/service"


let root = null

beforeEach(async () => {
	root = await RootService.Start({
		class: "email",
		account: <IEmailAccount>{
			// https://ethereal.email/login
			host: 'smtp.ethereal.email',
			port: 587,
			auth: {
				user: 'robin.cummerata65@ethereal.email',
				pass: 'EBnZ54KhH68uUKawGf'
			}
		},
	})
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("invio email", async () => {
	const email = new PathFinder(root).getNode<EmailService>("/email")
	expect(email).toBeInstanceOf(EmailService)

	let res = false


	// intanto intercetto l'EVENT
	email.emitter.once(ServiceBaseEvents.DISPATCH, (action)=>{
		res = true
	})
	// invio l'email
	await email.dispatch({
		type: EmailActions.SEND,
		payload: <IEmail>{
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
	res = await email.dispatch({
		type: EmailActions.CHECK,
		payload: "iorioivano@gmail.com"
	})
	expect(res).toBeTruthy()


	// controllo esista un email
	res = await email.dispatch({
		type: EmailActions.CHECK,
		payload: "pippojksdfhlghsjkfsd@gmail.com"
	})
	expect(res).not.toBeTruthy()
})