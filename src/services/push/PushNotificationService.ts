import { ServiceBase } from "../../core/service/ServiceBase"
import { ErrorServiceActions } from "../error"
import { Bus } from "../../core/path/Bus"
import * as admin from "firebase-admin"



export enum PushNotificationActions {
	SEND = "pn:send",
}

class PushNotificationService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "push",
			// le credenziali per SDK FIREBASE. 
			// Per i test l'ho generata qui:
			// https://console.firebase.google.com/u/0/project/extreme-citadel-739/settings/serviceaccounts/adminsdk
			credential: "",
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			// https://firebase.google.com/docs/cloud-messaging/send-message
			[PushNotificationActions.SEND]: async (state, message) => {
				return await this.sendNotify(message)
			},

		}
	}

	private app: admin.app.App = null


	protected async onInit() {
		super.onInit()

		// JSON credential (from firebase console)
		const { credential } = this.state

		// initialize app
		try {
			this.app = admin.initializeApp({
				credential: admin.credential.cert(credential),
			})
		} catch (error) {
			new Bus(this, "/error").dispatch({ type: ErrorServiceActions.NOTIFY, payload: { code: "init", error } })
			throw error
		}
	}

	// protected async onDestroy() {
	// 	super.onDestroy()
	// }


	/**
	 * Invia un messaggio ad uno specifico device
	 * @param message  https://firebase.google.com/docs/reference/admin/node/admin.messaging.Message?hl=en  
	 * messaggio da inviare
	 * @returns 
	 * id del messaggio inviato (e non ci sono errori)
	 */
	private async sendNotify(message: admin.messaging.Message): Promise<string> {
		// Send a message to the device corresponding to the provided registration token.
		// return the message id
		try {
			const messageId = await admin.messaging().send(message)
			debugger
			return messageId
		} catch (error) {
			new Bus(this, "/error").dispatch({ type: ErrorServiceActions.NOTIFY, payload: { code: "send", error } })
			throw error
		}
	}
}

export default PushNotificationService
