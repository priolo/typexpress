import { INode } from "../node/INode.js"
import { PathFinder } from "./PathFinder.js"
import { nodeFind } from "../utils.js"
import { fnNodePattern } from "../utils.js"


/**
 * Permette di selezionare un nodo da una lista di nodi
 * tramite un pattern
 */
export class PathFinderList {
	constructor(nodes: INode[]) {
		this.nodes = nodes;
	}

	private nodes: INode[];

	/** 
	 * Preleva il primo node-path dell'array  
	 */
	getFirst(): PathFinder | null {
		const node = this.nodes[0]
		return node != null ? new PathFinder(node) : null
	}

	/**
	 * Preleva il CHILD tramite il "pattern"
	 * @param pattern 
	 * @returns 
	 */
	getBy(pattern: string): PathFinder | null {
		let node = null

		// se è un NUMBER prendo il CHILDREN tramite il suo INDEX
		let i = parseInt(pattern)
		if (!isNaN(i)) {
			node = this.nodes[i]

			// altrimenti...
		} else {
			// se inizia con ">" allora fai una ricerca ricorsiva
			let deep = pattern.startsWith(">")
			if (deep) pattern = pattern.slice(1)
			const fn = fnNodePattern(pattern)
			node = deep
				? nodeFind(this.nodes, n => fn(n))
				: this.nodes.find(n => fn(n))
		}

		return node != null ? new PathFinder(node) : null
	}
}