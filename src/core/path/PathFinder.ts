import { INode } from "../node/INode.js"
import { fnNodePattern, nodeParents } from "../utils.js"
import { PathFinderList } from "./PathFinderList.js"


/**
 * Permette di navigare all'interno di un albero di nodi
 * tramite una stringa di path
 */
export class PathFinder {

	/** 
	 * [facility]: restituisce un NODE
	 * */
	static Get<T=INode>(node: INode, path: string): T {
		return new PathFinder(node).getNode<T>(path)
	}


	constructor(node: INode) {
		if (node == null || !node.children || !node.name) throw new Error("PathFinder:constructor:argument:invalid:need-INode")
		this.node = node
	}

	/**
	 * Il node a cui punta il pathfinder
	 */
	readonly node: INode

	/**
	 * Restituisce un "PathFinder" che punta ad un "node" 
	 * ricavato seguendo la path del parametro
	 * Se non lo trova restituisce null
	 */
	path(path: string): PathFinder | null {
		if (!path || path.length == 0) return this

		let nextPathFinder: PathFinder | null
		let nextPath: string

		// vai alla radice
		if (path.startsWith("/")) {
			nextPathFinder = new PathFinder(nodeParents(this.node))
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
			if (pattern.startsWith("<")) {
				pattern = path.slice(1)
				const fn = fnNodePattern(pattern)
				const nodeParent = nodeParents(this.node, n => !fn(n))
				nextPathFinder = nodeParent != null ? new PathFinder(nodeParent) : null

			// NEAR: ricerca su oggetto tra i miei children e ricorsivamente su quelli del parent
			} else if (pattern.startsWith("^")) {
				pattern = path.slice(1)
				let nodeFind: INode
				nodeParents(this.node, n => {
					const child = new PathFinderList(n.children).getBy(pattern)?.node
					if ( child != null ) {
						nodeFind = child
						return false
					}
				})
				nextPathFinder = nodeFind != null ? new PathFinder(nodeFind) : null

				// se è una ricerca sui children (diretti)
			} else {
				nextPathFinder = this.getChildren().getBy(pattern)
			}

			nextPath = index != -1 ? path.slice(index + 1) : ""
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
	 * Restituisce se esiste o meno il nodo
	 * @returns 
	 */
	exists(): boolean {
		return this.node != null
	}

	/**
	 * restituisce i children del nodo corrente (dentro PathFinderList)
	 */
	private getChildren(): PathFinderList {
		return new PathFinderList(this.node.children);
	}

}
