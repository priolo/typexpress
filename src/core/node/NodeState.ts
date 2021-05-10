import { Node } from "./Node";
import { Action } from "./Action";
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
	async dispatch(action: Action): Promise<any> {
		log(`${this.name}:${action.type}`, LOG_TYPE.DEBUG, action.payload)
		// [II] buffering
		// [II] spostare gli arguments della funzione in: playload, state, sender
		return this.dispatchMap[action.type](this.state, action.payload, action.sender)
	}

	/**
	 * una mappa di possibili Actions 
	 * che si possono eseguire in questo nodo
	 */
	protected get dispatchMap(): any {
		return {}
	}
}