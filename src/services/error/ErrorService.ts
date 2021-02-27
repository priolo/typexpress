import { ServiceBase } from "../../core/ServiceBase"
import { log, LOG_OPTION } from "../../utils/log";


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
			[ErrorServiceActions.NOTIFY]: async (state, error, sender) => this.notify(error, sender),
		}
	}

    private notify ( error:string, sender:string ): void {
        log(`${sender}::${error}`, LOG_OPTION.ERROR)
    }

}