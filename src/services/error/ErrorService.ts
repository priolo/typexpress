import { ServiceBase } from "../../core/service/ServiceBase"
import { INode } from "../../core/node/utils";
import { Bus } from "../../core/path/Bus"
import { Actions } from "./utils"

import { log, LOG_TYPE } from "@priolo/jon-utils";
import { ErrorNotify } from "./ErrorNotify";


/**
 * Si occupa di ricevere gli errori dei nodi e intervenire
 */
export default class ErrorService extends ServiceBase {

	/**
	 * [facility] manda un error al gestore degli errori
	 * @param node 
	 * @param code 
	 * @param error 
	 */
	static Send(node:INode, error:Error, code?:string) {
		new Bus(node, "/error").dispatch({ 
			type: Actions.NOTIFY, 
			payload: { code, error } 
		})
	}

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "error",
			onError: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[Actions.NOTIFY]: async (state:any, error:ErrorNotify | string, sender:string) => {
				this.onNotify(sender, error)
			},
		}
	}

	/**
	 * Richiamato quando c'e' la segnalazione di un errore
	 * Gestione di default
	 * @param sender 	path del nodo che ha mandato l'errore
	 * @param error 	l'errore
	 */
	protected onNotify(sender: string, error: ErrorNotify | string): void {
		const { onError } = this.state
		if (typeof error == "string") error = new ErrorNotify(error)
		error.sender = sender
		//log(`${sender}::${error.code}`, LOG_TYPE.ERROR)
		onError?.bind(this)(error)
	}

}
