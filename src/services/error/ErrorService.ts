import { ServiceBase } from "../../core/service/ServiceBase"
import { INode } from "../../core/node/INode";
import { Bus } from "../../core/path/Bus"
import { Actions } from "./utils"

import { log, LOG_TYPE } from "@priolo/jon-utils";
import { ErrorLevel, ErrorNotify } from "./ErrorNotify";


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
	static Send(node: INode, error: Error | string, code?: string, level?:ErrorLevel) {
		const e = new ErrorNotify(error, code, level)
		new Bus(node, "/error").dispatch({
			type: Actions.NOTIFY,
			payload: e
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
			[Actions.NOTIFY]: async (state: any, error: ErrorNotify, sender: string) => {
				this.onNotify(error, sender)
			},
		}
	}

	/**
	 * Richiamato quando c'e' la segnalazione di un errore
	 * Gestione di default
	 * @param error 	l'errore
	 * @param sender 	path del nodo che ha mandato l'errore
	 */
	protected onNotify(error: ErrorNotify, sender: string): void {
		const { onError } = this.state
		onError?.bind(this)(error, sender)
	}

}
