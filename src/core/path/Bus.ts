import { Action } from "core/node/Action";
import { INode } from "core/node/INode";
import { NodeState } from "core/node/NodeState";
import { log, LOG_OPTION } from "../../utils/log";
import { PathFinder } from "./PathFinder";

/**
 * Permette di consegnare un ACTION ad un NODE
 * tramite il suo PATH
 * e quindi chiama il dispatch
 */
export class Bus {
	constructor ( sender:INode, path:string ) {
		this.sender = sender
		this.path = path
	}

	private sender:INode = null
	private path:string = null

	async dispatch ( action:Action ): Promise<any> {
		const node = new PathFinder(this.sender).getNode<NodeState>(this.path)
		// [II] da implementare:
		// [await:millisec] se presente un opzione il messaggio viene bufferizzato quindi c'e' un controllo se esiste il nodo per tot tempo
		if ( !node ) {
			log(`bus:path:${this.path}:not_found`, LOG_OPTION.ERROR)
			return null
		}
		return await node.dispatch(action)
	}
}