import { ServiceBase } from "../../core/service"
import { log, LOG_TYPE } from "@priolo/jon-utils";
import { Error, ErrorServiceActions } from "./utils"



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

	private notify(sender: string, error: Error | string): void {
		if (error instanceof Error) error = { code: error.message }
		if (typeof error == "string") error = { code: error }
		log(`${sender}::${error.code}`, LOG_TYPE.ERROR)
	}

}


