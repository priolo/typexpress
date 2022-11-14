import winston from "winston";
import LogTransportService from "./LogTransportService";


/**
 * Crea internamente il TRANSPORT
 */
export default class LogTransportFileService extends LogTransportService {

	//#region SERVICE

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "transport-file",
			filename: "",
		}
	}

	//#endregion


	
	protected buildTransport(): void {
		const { filename } = this.state
		this.transport = new winston.transports.File({
			filename
		})
	}

}
