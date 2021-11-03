import { INode } from "../node/utils"
import { PathFinder } from "./PathFinder"
import { nodeFind } from "../utils"
import { fnNodePattern } from "../utils"


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

	/**
	 * Data una stringa path 
	 * restituisce la funzione di uguaglianza 
	 * da utilizzare per quello stesso path
	 * @param pattern 
	 * @returns 
	 */
	// getFnPattern(pattern: string): (n: INode) => boolean {

	// 	// by id
	// 	if (pattern.startsWith("*")) {
	// 		let id = pattern.slice(1)
	// 		return (n: INode) => n.id == id

	// 		// by classname
	// 	} else if (pattern.startsWith("~")) {
	// 		let className = pattern.slice(1)
	// 		return (n: INode) => n.constructor && n.constructor.name == className

	// 		// preleva il nodo con le caratteristiche indicate
	// 	} else if (pattern.startsWith("{")) {
	// 		const substr = pattern.slice(0, pattern.indexOf("}") + 1)
	// 		const params = JSON.parse(substr)
	// 		return (node: INode) => {
	// 			return node instanceof NodeState && obj.objectIsIn(params, node.state)
	// 		}
	// 		// by name
	// 	} else {
	// 		return (n: INode) => n.name == pattern
	// 	}
	// }

	// forEach(callback: (T) => void, options?: { deep: boolean, clazz: any }): void {
	// 	if (callback == null) throw new Error("invalid parameter 'callback'")
	// 	const { deep, clazz } = options ?? { deep: true, clazz: null }
	// 	const className: string = clazz instanceof String ? clazz
	// 		: clazz != null ? new clazz().constructor.name : null

	// 	for (let child of this.nodes) {
	// 		if (className != null && child.constructor.name == className) continue
	// 		callback(child)
	// 		if (deep) {
	// 			const pNode = new PathFinderList(child.children)
	// 			pNode.forEach(callback, options)
	// 		}
	// 	}
	// }
}