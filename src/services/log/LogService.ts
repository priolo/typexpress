import { INode } from "../../core/node/INode.js";
import winston from "winston";
import TransportService from "./transport/TransportService.js";
import { Actions, LogLevel, LogNotify } from "./utils.js";
import { ServiceBase } from "../../core/service/ServiceBase.js";
import { Bus } from "../../core/path/Bus.js";



export type LogConf = Partial<LogService['stateDefault']> & { class: "log" }
interface LogAction {
	type: Actions.LOG
	payload: LogLevel
}

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
	static Send(node: INode, message: string, level?: LogLevel) {
		new Bus(node, "/log").dispatch({
			type: Actions.LOG,
			payload: { message, level }
		})
	}



	//#region SERVICE

	get stateDefault() {
		return {
			...super.stateDefault,
			name: <string>"log",
			onLog: <(notify: LogNotify) => void>null,
		}
	}

	get executablesMap(): any {
		return {
			...super.executablesMap,
			[Actions.LOG]: (log: LogNotify, sender: string) => this.onNotify(log, sender),
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



	private logger: winston.Logger = null

	private buildLog(): void {

		const transports = (<TransportService[]>this.children).map(c => c.getTransport?.()).filter(c => !!c)
		if (transports.length == 0) return

		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: { service: 'user-service' },
			transports
		})
	}

	protected onNotify(notify: LogNotify, sender?: string): void {
		const senderName = sender ?? "log"
		const level = notify?.level ?? LogLevel.INFO
		const message = notify?.message ?? "<null>"

		// use winston
		if (!this.logger) {
			const color = {
				[LogLevel.ERROR]: LOG_CMM.BgRed,
				[LogLevel.WARN]: LOG_CMM.BgYellow,
				[LogLevel.INFO]: LOG_CMM.BgBlue,
			}[level] ?? ""
			console.log(`${color} ${level} ${LOG_CMM.Reset}::[${senderName}]`, message)

			// use console
		} else {
			this.logger.log(level, message)
		}
		this.state.onLog?.bind(this)(notify)
	}

}



const LOG_CMM = {
	Reset: "\x1b[0m",
	Bright: "\x1b[1m",
	Dim: "\x1b[2m",
	Underscore: "\x1b[4m",
	Blink: "\x1b[5m",
	Reverse: "\x1b[7m",
	Hidden: "\x1b[8m",

	FgBlack: "\x1b[30m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m",
	FgYellow: "\x1b[33m",
	FgBlue: "\x1b[34m",
	FgMagenta: "\x1b[35m",
	FgCyan: "\x1b[36m",
	FgWhite: "\x1b[37m",

	BgBlack: "\x1b[40m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m",
	BgWhite: "\x1b[47m",
}