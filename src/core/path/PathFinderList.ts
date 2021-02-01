import { INode } from "../node/INode";
import { PathFinder } from "./PathFinder";
import { nodeFind } from "../utils"

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

	getBy(pattern: string): PathFinder | null {
		let node = null

		let i = parseInt(pattern)
		if (!isNaN(i)) {
			node = this.nodes[i]

		} else {
			let deep = pattern.startsWith(">")
			if (deep) pattern = pattern.slice(1)
			const fn = this.getFnPattern(pattern)
			node = deep
				? nodeFind(this.nodes, n => fn(n))
				: this.nodes.find(n => fn(n))
		}

		return node != null ? new PathFinder(node) : null
	}

	getFnPattern(pattern: string): (n: INode) => boolean {

		// by id
		if (pattern.startsWith("*")) {
			let id = pattern.slice(1)
			return (n: INode) => n.id == id

		// by classname
		} else if (pattern.startsWith("~")) {
			let className = pattern.slice(1)
			return (n: INode) => n.constructor && n.constructor.name == className

		// by name
		} else {
			return (n: INode) => n.name == pattern
		}
	}

	forEach(callback: (T) => void, options?: { deep: boolean, clazz: any }): void {
		if (callback == null) throw new Error("invalid parameter 'callback'")
		const { deep, clazz } = options ?? { deep: true, clazz: null }
		const className: string = clazz instanceof String ? clazz
			: clazz != null ? new clazz().constructor.name : null

		for (let child of this.nodes) {
			if (className != null && child.constructor.name == className) continue
			callback(child)
			if (deep) {
				const pNode = new PathFinderList(child.children)
				pNode.forEach(callback, options)
			}
		}
	}
}