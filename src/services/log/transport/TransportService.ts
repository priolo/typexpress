import winston from "winston";
import { ServiceBase } from "../../../index.js";
import { LogLevel } from "../utils.js";



/**
 * Crea internamente il TRANSPORT
 */
export default abstract class TransportService extends ServiceBase {

	//#region SERVICE

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "transport",
			level: LogLevel.INFO,
		}
	}

	protected async onInit(): Promise<void> {
		await super.onInit()
		this.buildTransport()
	}

	protected async onDestroy(): Promise<void> {
		this.destroyTransport()
	}

	//#endregion



	protected transport: winston.transport

	protected abstract buildTransport(): void 

	protected destroyTransport(): void {
		this.transport?.close?.()
		this.transport = null
	}

	getTransport(): winston.transport {
		return this.transport
	}

}
