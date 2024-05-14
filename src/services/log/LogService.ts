import winston from "winston";
import { Bus, ServiceBase } from "../../index"
import { Actions, LogLevel, LogNotify } from "./utils"
import { INode } from "core/node/INode";
import LogTransportService from "./LogTransportService";


/**
 * Permette di gestire i log.. per esempio su console o su file
 * essenzialmente utilizza winstonjs
 */
export default class LogService extends ServiceBase {

	/**
	 * [facility] manda un messaggio al logger
	 * @param node 
	 * @param message 
	 * @param level 
	 */
	 static Send(node: INode, message: string, level: LogLevel) {
		new Bus(node, "/log").dispatch({
			type: Actions.LOG,
			payload: { message, level }
		})
	}



	//#region SERVICE

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "log",
			onLog: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[Actions.LOG]: async (state: any, log: LogNotify, sender: string) => {
				this.onNotify(log, sender)
			},
		}
	}

	/**
	 * Creao l'istanza del logger
	 */
	protected async onInitAfter(): Promise<void> {
		super.onInitAfter()
		this.buildLog()
	}

	//#endregion



	private logger: winston.Logger

	private buildLog(): void {
		const transports = (<LogTransportService[]>this.children).map ( c => c.getTransport())
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: { service: 'user-service' },
			transports
		})
	}

	protected onNotify(notify: LogNotify, sender: string): void {
		const { onLog } = this.state
		//log(`${sender}::${logMessage}`, LOG_TYPE.ERROR)
		this.logger.log(notify.level, notify.message)
		onLog?.bind(this)(notify)
	}

}
