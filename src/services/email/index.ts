export enum EmailActions {
    CREATE_TEST_ACCOUNT = "createTestAccount",
    /**
     * Crea un account. E' equivalente a settare lo state "account"
     * payload: account:IEmailAccount
     */
    CREATE_ACCOUNT = "createAccount",
    /**
     * Invia un email all'account settato nello "state"
     * payload: email:IEmail
     */
    SEND = "send",
    /** 
     * controlla l'esistenza di un email
     * payload: address:string
     */
    CHECK = "check",
}

export interface IEmailAccount {
    host: string,
    port: number,
    secure: boolean,
    auth: { user: string, pass: string },
}

export interface IEmail {
    from: string, 		// sender address
    to: string, 		// list of receivers
    subject: string, 	// Subject line
    text: string, 		// plain text body
    html: string, 		// html body
}

import EmailService from "./EmailService"
export { EmailService }
export default EmailService
