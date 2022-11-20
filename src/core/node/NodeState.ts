import { Node } from "./Node";
import { IAction } from "./IAction";
import { log, LOG_TYPE } from "@priolo/jon-utils";


/**
 * Classe responsabile di mantenere uno stato in "state"
 * e cambiare lo stato tramite "dispatch"
 */
export abstract class NodeState extends Node {

	/**
	 * Stato attuale del nodo
	 */
	get state(): any {
		return this._state
	}
	protected _state: any = {}

	/**
	 * Modifica lo stato
	 * notare che si tratta sempre di un MERGE
	 * @param state 
	 */
	public setState(state: any): void {
		if (this._state == state) return
		const old = this._state
		this._state = { ...this._state, ...state }
		this.onChangeState(old)
	}

	/**
	 * [abstract] chiamato quando lo stato cambia
	 */
	protected onChangeState(old: any): void { }

	/**
	 * permette di eseguire una Action
	 * @param action 
	 */
	dispatch(action: IAction): any {
		log(`${this.name}:${action.type}`, LOG_TYPE.DEBUG, action.payload)

		// [II] GESTIONE LOG

		// [II] buffering
		// [II] spostare gli arguments della funzione in: playload, state, sender

		const fnc = this.dispatchMap[action.type]
		try {
			if (fnc.constructor.name === "AsyncFunction") {
				return new Promise(async (res, rej) => {
					try {
						const ret = await this.dispatchMap[action.type](this.state, action.payload, action.sender)
						res(ret)
					} catch (e) {
						rej(e)
					}
				})
			} else {
				return this.dispatchMap[action.type](this.state, action.payload, action.sender)
			}
		} catch (error) {
			// [II] GESTIONE ERRORI
		}


	}

	/**
	 * una mappa di possibili Actions 
	 * che si possono eseguire in questo nodo
	 */
	protected get dispatchMap(): DispatchMap {
		return {}
	}
}

type DispatchMap = { [key: string]: Dispatch }

type Dispatch = (state: any, payload: any, sender: string) => any