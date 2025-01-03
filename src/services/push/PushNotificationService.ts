import { ServiceBase } from "../../core/service/ServiceBase.js"
import { Bus } from "../../core/path/Bus.js"

import * as errorNs from "../error/index.js"
import * as admin from "firebase-admin"
import { Actions, Errors } from "./utils.js"


export class PushNotificationService extends ServiceBase {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "push",
			// le credenziali per SDK FIREBASE. 
			// Per i test l'ho generata qui:
			// https://console.firebase.google.com/u/0/project/extreme-citadel-739/settings/serviceaccounts/adminsdk
			credential: "",
		}
	}

	get executablesMap(): any {
		return {
			...super.executablesMap,
			// https://firebase.google.com/docs/cloud-messaging/send-message
			[Actions.SEND]: async (message: any) => await this.sendNotify(message),

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
			new Bus(this, "/error").dispatch({
				type: errorNs.Actions.NOTIFY,
				payload: { code: Errors.INIT, error }
			})
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
			return messageId
		} catch (error) {
			new Bus(this, "/error").dispatch({
				type: errorNs.Actions.NOTIFY,
				payload: { code: Errors.SEND, error }
			})
			throw error
		}
	}
}


