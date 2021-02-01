import { Action } from "core/node/Action";
import { INode } from "core/node/INode";
import { NodeState } from "core/node/NodeState";
import { log, LOG_OPTION } from "../../utils/log";
import { PathFinder } from "./PathFinder";


export class Bus {
	constructor ( sender:INode, path:string ) {
		this.sender = sender
		this.path = path
	}

	private sender:INode = null
	private path:string = null

	async dispatch ( action:Action ): Promise<any> {
		const node = new PathFinder(this.sender).getNode<NodeState>(this.path)
		if ( !node ) {
			log(`bus:path:${this.path}:not_found`, LOG_OPTION.ERROR)
			return null
		}
		return await node.dispatch(action)
	}
} 