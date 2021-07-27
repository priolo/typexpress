import { ServiceBase } from "../../core/service/ServiceBase"
import nodemailer, {Transporter} from "nodemailer"
import emailCheck from "email-check"
import { EmailActions, IEmail, IEmailAccount } from "./index"


class EmailService extends ServiceBase {

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

export default EmailService