import { fnNodePattern, nodeParents } from "../utils"
import { INode } from "../node/INode"
import { PathFinderList } from "./PathFinderList"



export class PathFinder {
	constructor(node: INode) {
		if ( node==null || !node.children || !node.name ) throw new Error("PathFinder:constructor:argument:invalid:need-INode")
		this.node = node
	}

	readonly node: INode

	/**
	 * Restituisce un "PathFinder" che punta ad un "node"
	 * ricavato seguendo la path del parametro
	 * @param path 
	 */
	path(path: string): PathFinder | null {
		if (path.length == 0) return this

		let nextPathFinder: PathFinder | null
		let nextPath: string

		// vai alla radice
		if (path.startsWith("/")) {
			nextPathFinder = this.getRoot()
			nextPath = path.slice(1)

		// vai al parent
		} else if (path.startsWith("..")) {
			nextPathFinder = new PathFinder(this.node.parent ?? this.node)
			nextPath = path.slice(2)

		// preleva un nodo tramite il nome / indice / class-type
		} else {
			let index = path.indexOf("/")
			let pattern = index != -1 ? path.slice(0, index) : path

			// se è una ricerca sul parent
			if ( pattern.startsWith("<") ) {
				pattern = path.slice(1)
				const fn = fnNodePattern( pattern )
				const nodeParent = nodeParents(this.node, (node)=>!fn(node) )
				nextPathFinder = new PathFinder(nodeParent)
			
			// se è una ricerca sui children
			} else {
				nextPathFinder = this.getChildren().getBy(pattern)
			}

			nextPath = index != -1 ? path.slice(index+1) : ""
		}

		return nextPathFinder ? nextPathFinder.path(nextPath) : null
	}

	/**
	 * Come "path" ma restituisce direttamente il "node" tipizzato
	 * @param path 
	 */
	getNode<T>(path: string): T {
		return this.path(path)?.node as unknown as T
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
