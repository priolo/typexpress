import { log, LOG_TYPE } from "@priolo/jon-utils";
import { IAction } from "./IAction.js";
import { Node } from "./Node.js";
import { Bus } from "../path/Bus.js";



// export interface NodeStateConf {
// 	name?: string
// 	children?: NodeStateConf[]
// }

export type NodeStateConf = Partial<NodeState['stateDefault']>

/**
 * - Classe responsabile di mantenere uno STATE
 * - cambiare e notificare lo STATE
 * - eseguire un ACTION
 */
export abstract class NodeState extends Node {

	constructor(name?: string, state?: any) {
		super(name)
		this.setState({
			...this.stateDefault,
			...state
		})
		if (!name && this.state.name?.length > 0) {
			this.name = this.state.name
		}
	}

	//#region STATE

	/**
	 * in "constructor" viene mergiato con lo STATE di istanza
	 * determina il valore iniziale dello STATE
	 */
	get stateDefault() {
		return {
			name: <string>null,
			children: <any[]>null,
		}
	}

	/**
	 * Stato attuale del nodo
	 */
	get state() {
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

	//#endregion



	//#region DISPATCH

	/**
	 * una mappa di possibili Actions 
	 * che si possono eseguire in questo nodo
	 */
	protected get dispatchMap(): DispatchMap {
		return {}
	}

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
						//const ret = await this.dispatchMap[action.type](this.state, action.payload, action.sender)
						const ret = await fnc(this.state, action.payload, action.sender)
						res(ret)
					} catch (e) {
						rej(e)
					}
				})
			} else {
				//return this.dispatchMap[action.type](this.state, action.payload, action.sender)
				return fnc(this.state, action.payload, action.sender)
			}
		} catch (error) {
			// [II] GESTIONE ERRORI
		}
	}

	/**
	 * [facility] permette di eseguire un DISPATCH ad un CHILD
	 */
	dispatchTo(path: string, action: IAction): any {
		return new Bus(this, path).dispatch(action)
	}

	//#endregion
}

type DispatchMap = { [key: string]: Dispatch }

/**
 * la funzione eseguita quand arriva un DISPATCH al NODE
 * @param state lo stato attuale del NODE
 * @param payload i dati inviati con il DISPATCH
 * @param sender la path del NODE che ha inviato il DISPATCH
 */
type Dispatch = (state: any, payload: any, sender: string) => any