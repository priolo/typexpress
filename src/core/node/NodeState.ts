import { Node } from "./Node";
import { Action } from "./Action";


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
	protected setState( state:any ):void {
		if ( this._state == state ) return
		const old = this._state
		this._state = { ...this._state, ...state }
		this.onChangeState(old)
	}

	/**
	 * ABSTRACT chiamato quando lo stato cambia
	 */
	protected onChangeState(old: any): void { }

	/**
	 * permette di eseguire una Action
	 * @param action 
	 */
	async dispatch(action: Action): Promise<any> {
		// [II] buffering
		// [II] spostare this.state al posto di action.payload
		return this.dispatchMap[action.type](this.state, action.payload)
	}

	/**
	 * una mappa di possibili Actions che si possono eseguire in questo nodo
	 */
	protected get dispatchMap(): any {
		return {}
	}
}