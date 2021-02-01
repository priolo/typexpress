import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { ConfActions } from "../../../core/node/NodeConf"
import { EmailService, EmailActions, IEmailAccount, IEmail } from "../EmailService"


let root = null

beforeEach(async () => {
	root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
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
				},
			]
		}
	})
})
afterAll(async () => {
	await root.dispatch({ type: ConfActions.STOP })
})

test("invio email", async () => {
	
	const email = new PathFinder(root).getNode<EmailService>("/email")
	expect(email instanceof EmailService).toBeTruthy()

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

	let res = await email.dispatch({
		type: EmailActions.CHECK,
		payload: "iorioivano@gmail.com"
	})
	expect(res).toBeTruthy()

	res = await email.dispatch({
		type: EmailActions.CHECK,
		payload: "pippojksdfhlghsjkfsd@gmail.com"
	})
	expect(res).not.toBeTruthy()
})