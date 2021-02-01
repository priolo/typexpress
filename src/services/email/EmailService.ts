import { ServiceBase } from "../../core/ServiceBase"
import nodemailer, {Transporter} from "nodemailer"
import emailCheck from "email-check"
export enum EmailActions {
	CREATE_TEST_ACCOUNT= "createTestAccount",
	CREATE_ACCOUNT = "createAccount",
	SEND = "send",
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

export class EmailService extends ServiceBase {

	private transporter:Transporter = null

	get defaultConfig():any {
		return {
			...super.defaultConfig,
			name: "email",
			account: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,

			[EmailActions.CREATE_TEST_ACCOUNT]: async (state) => {
				const account = await nodemailer.createTestAccount()
				this.setState( {account} )
			},

			[EmailActions.CREATE_ACCOUNT]: (state, account:IEmailAccount) => {
				this.setState( {account} )
			},
			[EmailActions.SEND]: async (state, email:IEmail) => {
				await this.transporter.sendMail(email)
			},
			[EmailActions.CHECK]: async (state, address:string) => {
				let res = false
				try {
					res = await emailCheck(address)
				} catch ( err ) {
					if (err.message === 'refuse') {
						// The MX server is refusing requests from your IP address.
					} else {
						// Decide what to do with other errors.
					}
				}
				return res
			},
		}
	}

	protected onChangeState(old: any): void { 
		super.onChangeState(old)
		const {account} = this.state
		if ( old.account==account ) return
		if ( !account ) {
			this.transporter?.close()
			this.transporter = null
			return
		}
		this.transporter = nodemailer.createTransport(account)
	}

}