import winston from "winston";
import TransportService from "./TransportService";



export type FileConf = Partial<FileService['stateDefault']> & { class: "log/file" }

/**
 * Crea internamente il TRANSPORT
 */
export default class FileService extends TransportService {

	//#region SERVICE

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "transport-file",
			filename: "",
		}
	}

	//#endregion
	
	
	protected buildTransport(): void {
		this.transport = new winston.transports.File({
			filename: this.state.filename
		})
	}

}
