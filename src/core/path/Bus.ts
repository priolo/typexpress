import { IAction } from "../node/IAction";
import { INode } from "../node/INode";
import { NodeState } from "../node/NodeState";
import { nodePath } from "../utils";
import { log, LOG_TYPE } from "@priolo/jon-utils";
import { PathFinder } from "./PathFinder";
import { time } from "@priolo/jon-utils"


/**
 * Permette di consegnare un ACTION ad un NODE
 * tramite il suo PATH
 * e quindi chiama il dispatch
 */
export class Bus {
	constructor(sender: INode, path: string) {
		this.sender = sender
		this.path = path
	}

	private sender: INode = null
	private path: string = null
	private bufferWait: IAction[] = []

	/**
	 * Consegna un "Action" al suo destinatario partendo dal nodo "this.sender"
	 * @param action 
	 */
	async dispatch(action: IAction|string): Promise<any> {
		if ( typeof action=="string" ) action = { type: action } as IAction
		const dest = new PathFinder(this.sender).getNode<NodeState>(this.path)
		let res = null

		if (!action.sender) action.sender = nodePath(this.sender)
		action.sendTime = Date.now()

		// [II] da implementare:
		// [await:millisec] se presente un opzione il messaggio viene bufferizzato quindi c'e' un controllo se esiste il nodo per tot tempo
		if (dest) {
			res = await dest.dispatch(action)
		// se il nodo destinazione non c'e' allora metto la action nel buffer
		} else {
			this.bufferWaitPush(action)
		}

		this.bufferWaitDebounce()
		return res
	}


	//#region BUFFER

	/**
	 * Cerca di risolvere tutte le ACTION presenti nel buffer
	 * [II] ERRORE!!! se ci sono molte actions il debounce non si attiverà e fara' passare il tempo dopo il quale la action viene distrutta
	 */
	private bufferWaitResolve(): void {
		if (this.bufferWait.length == 0) return
		const now = Date.now()
		const actions = [...this.bufferWait]
		for (const action of actions) {
			const delta = now - action.sendTime
			const index = this.bufferWait.indexOf(action)
			this.bufferWait.splice(index, 1)
			if (delta < action.wait) {
				this.dispatch(action)
			}
		}
	}

	/**
	 * Inserisce un action nel buffer
	 * @param action 
	 */
	private bufferWaitPush(action: IAction): void {
		log(`bus:path:[${this.path}]:not_found`, LOG_TYPE.ERROR)
		if (!action.wait || action.wait == 0) return
		this.bufferWait.push(action)
	}

	/**
	 * Aspetta un po' di tempo e poi effettua la soluzione del buffer
	 * non lo faccio subito altrimenti poi le performance che dicono he?
	 */
	private bufferWaitDebounce(): void {
		if ( this.bufferWait.length == 0 ) return
		time.debounce("bus:buffer:wait", this.bufferWaitResolve.bind(this), 500)
	}

	//#endregion
}