import { nodeParents } from "../utils"
import { INode } from "../node/INode"
import { PathFinderList } from "./PathFinderList"



export class PathFinder {
	constructor(node: INode) {
		if ( node==null ) throw new Error("PathFinder:constructor:argument:invalid")
		this.node = node
	}

	readonly node: INode

	/**
	 * Restituisce un "PathFinder" che punta ad un "node"
	 * ricavato seguendo la path del parametro
	 * @param p 
	 */
	path(p: string): PathFinder | null {
		if (p.length == 0) return this

		let nextPathFinder: PathFinder | null
		let nextPath: string

		// vai alla radice
		if (p.startsWith("/")) {
			nextPathFinder = this.getRoot()
			nextPath = p.slice(1)

		// vai al parent
		} else if (p.startsWith("..")) {
			nextPathFinder = new PathFinder(this.node.parent ?? this.node);
			nextPath = p.slice(2)

		// preleva un nodo tramite il nome / indice / class-type
		} else {
			let index = p.indexOf("/")
			let pattern = index != -1 ? p.slice(0, index) : p
			nextPathFinder = this.getChildren().getBy(pattern)
			nextPath = index != -1 ? p.slice(index+1) : ""
		}

		return nextPathFinder ? nextPathFinder.path(nextPath) : null
	}

	/**
	 * Come "path" ma restituisce direttamente il "node" tipizzato
	 * @param p 
	 */
	getNode<T>(p: string): T {
		return this.path(p)?.node as unknown as T
	}

	/**
	 * restituisce i children del nodo corrente (dentro PathFinderList)
	 */
	private getChildren(): PathFinderList {
		return new PathFinderList(this.node.children);
	}

	/**
	 * restituisce la root del nodo corrente (dentro PathFinder)
	 */ 
	private getRoot(): PathFinder {
		const root = nodeParents(this.node)
		return new PathFinder(root)
	}
	
}
