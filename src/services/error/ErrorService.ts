import { ServiceBase } from "../../core/ServiceBase"
import { log, LOG_TYPE } from "@priolo/jon-utils";


export enum ErrorServiceActions {
	NOTIFY = "notify"
}


/**
 * Si occupa di ricevere gli errori dei nodi e intervenire
 */
export class ErrorService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "error",
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ErrorServiceActions.NOTIFY]: async (state, error, sender) => this.notify(sender, error),
		}
	}

	private notify(sender: string, error: Error|string): void {
		if (typeof error == "string") error = { code: error }
		log(`${sender}::${error.code}`, LOG_TYPE.ERROR)
	}

}

interface Error {
	code:string,
	error?: any,
}