import { INode } from "../../core/node/INode.js";
import { Bus } from "../../core/path/Bus.js";
import { ServiceBase } from "../../core/service/ServiceBase.js";
import { ErrorNotify } from "./ErrorNotify.js";
import { ErrorLevel } from "./utils.js";
import { Actions, NotifyAction } from "./utils.js";



export type ErrorServiceConf = Partial<ErrorService['stateDefault']> & { class: "error" }

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
	static Send(node: INode, error: Error | string, code?: string, level?: ErrorLevel) {
		const e = new ErrorNotify(error, code, level)
		new Bus(node, "/error").dispatch(<NotifyAction>{
			type: Actions.NOTIFY,
			payload: e
		})
	}

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "error",
			onError: null,
		}
	}

	get dispatchMap() {
		return {
			...super.dispatchMap,
			/** quando viene generato un errore */
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
