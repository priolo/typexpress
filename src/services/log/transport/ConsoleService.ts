import winston from "winston";
import TransportService from "./TransportService.js";



export type ConsoleConf = Partial<ConsoleService['stateDefault']> & { class: "log/console" }

/**
 * Crea internamente il TRANSPORT
 */
export default class ConsoleService extends TransportService {

	//#region SERVICE

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "transport-console",
		}
	}

	//#endregion

	
	protected buildTransport(): void {
		this.transport = new winston.transports.Console()
	}

}
