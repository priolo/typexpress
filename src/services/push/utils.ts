

export enum Actions {
	/**
	 * invia un messaggio
	 * https://firebase.google.com/docs/cloud-messaging/send-message
	 */
	SEND = "pn:send",
}

/**
 * Gli errori gestiti da questo servizio
 */
 export enum Errors {
	INIT = "push:init",
	SEND = "push:send"
}