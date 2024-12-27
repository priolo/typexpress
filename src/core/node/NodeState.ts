import { Bus } from "../path/Bus.js";
import { IAction } from "./utils.js";
import { INode } from "./INode.js";
import { Node } from "./Node.js";
import { IChildLog } from "../service/utils.js";
import { nodePath } from "../utils.js";



export type NodeStateConf = Partial<NodeState['stateDefault']>

/**
 * - Classe responsabile di mantenere uno STATE
 * - cambiare e notificare lo STATE
 * - eseguire un ACTION
 */
export abstract class NodeState extends Node {

	constructor(name?: string, state = {}) {
		super(name)
		this._state = {
			...this.stateDefault,
			...state
		}
		if (!name && this.state.name?.length > 0) {
			this.name = this.state.name
		}
	}

	//#region STATE

	/**
	 * insieme allo STATO DI ISTANZA del NODE (con il quale viene mergiato)
	 * determina il valore iniziale dello STATE
	 */
	get stateDefault() {
		return {
			// name: <string>null,
			// children: <any[]>null,
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
	 * si tratta sempre di un MERGE con lo stato precedente
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

	/**
	 * [facility] crea e trasmette un nuovo LOG
	 */
	protected log(name: string, payload?: any) {
		this.emitLog({ source: nodePath(this), target: this, name, payload })
	}

	/**
	 * trasmette al parent un log
	 */
	emitLog(log: IChildLog) {
		if (!log ) return
		(<NodeState>this.parent)?.emitLog?.(log)
	}

	//#region EXECUTE

	/**
	 * una mappa di ESECUTORI di ACTIONS per questo NODE
	 */
	protected get executablesMap(): ExecutablesMap {
		return {}
	}

	/**
	 * permette di eseguire una ACTION di questo NODE
	 */
	execute(action: IAction): Promise<any> {
		const fnc = this.executablesMap[action.type]

		// se è ASYNC ritorna una PROMISE
		if (fnc.constructor.name === "AsyncFunction") {
			return new Promise(async (res, rej) => {
				try {
					const ret = await fnc(action.payload, action.sender, this)
					res(ret)
				} catch (e) {
					rej(e)
				}
			})
			// altrimenti ritorna il valore
		} else {
			return fnc(action.payload, action.sender, this)
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

/**
 * una mappa di ACTIONS eseguiili
 */
export type ExecutablesMap = { [key: string]: Executor }

/**
 * la funzione eseguita tramite un ACTION
 * @param payload i dati delll'ACTION
 * @param target il NODE che ha ricevuto eseguito 
 * @param sender la path del NODE che ha inviato il DISPATCH
 */
type Executor = (payload?: any, sender?: string, target?: INode) => any
