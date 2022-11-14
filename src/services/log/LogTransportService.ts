import { ServiceBase } from "../../index"

import winston from "winston";
import { LogLevel } from "./utils";


/**
 * Crea internamente il TRANSPORT
 */
export default abstract class LogTransportService extends ServiceBase {

	//#region SERVICE

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "transport",
			level: LogLevel.INFO,
		}
	}

	protected async onInit(conf:any): Promise<void> {
		await super.onInit(conf)
		this.buildTransport()
	}

	protected async onDestroy(): Promise<void> {
		this.destroyTransport()
	}

	//#endregion



	protected transport: winston.transport

	protected abstract buildTransport(): void 

	protected destroyTransport(): void {
		this.transport.close()
		this.transport = null
	}

	getTransport(): winston.transport {
		return this.transport
	}

}
