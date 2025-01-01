import { Actions, LogLevel, LogNotify } from "./types.js";
import { ServiceBase } from "../../core/service/ServiceBase.js";
import { NodeConf } from "../../core/node/NodeConf.js";



export type LogConf = Partial<LogService['stateDefault']> & { class: "log" }

/**
 * Permette di gestire i log.. per esempio su console o su file
 * essenzialmente utilizza winstonjs
 */
export class LogService extends ServiceBase {

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
		const parent = this.nodeByPath<ServiceBase>("..")
		parent.emitter.on('newListener', (event, listener) => {
			console.log(`New listener added for event: ${event}`);
		});
	
	}

	//#endregion



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