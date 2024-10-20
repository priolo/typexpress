import { ServiceBase } from "../../core/service/ServiceBase"
import nodemailer, {Transporter} from "nodemailer"
import emailCheck from "email-check"
import { Actions, IEmail, IAccount } from "./utils"


/**
 * Gestisce il traffico in uscita delle email tramite un account definito nel config
 */
export default class EmailService extends ServiceBase {

	private transporter:Transporter = null

	get stateDefault():any {
		return {
			...super.stateDefault,
			name: "email",
			account: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,

			[Actions.CREATE_TEST_ACCOUNT]: async (state) => {
				const account = await nodemailer.createTestAccount()
				this.setState( {account} )
			},

			[Actions.CREATE_ACCOUNT]: (state, account:IAccount) => {
				this.setState( {account} )
			},
			[Actions.SEND]: async (state, email:IEmail) => {
				await this.transporter.sendMail(email)
			},
			[Actions.CHECK]: async (state, address:string) => {
				let res = false
				try {
					res = await emailCheck(address)
				} catch ( err:any ) {
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
