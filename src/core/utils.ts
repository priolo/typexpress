import { INode } from "./node/INode"
//import { NodeState } from "./node/NodeState"
import { obj } from "@priolo/jon-utils"
import { NodeState } from "./node/NodeState"



/**
 * Cicla ricorsivamente tutti i nodi e chiama per ognuno il "callback"
 * @param nodes 
 * @param callback 
 */
export async function nodeForeach(nodes: INode | INode[], callback: (n: INode) => Promise<void>): Promise<void> {
	if (nodes == null) return
	if (!Array.isArray(nodes)) nodes = [nodes]
	for (const node of nodes) {
		await callback(node)
		await nodeForeach(node.children, callback)
	}
}

/**
 * cicla ricorsivamente tutti i nodi e chiama per ognuno il "callback"
 * se il callback restituisce true il ciclo si conclude e restituisce quel nodo
 * @param nodes 
 * @param callback 
 */
export function nodeFind(nodes: INode | INode[], callback: (n: INode) => boolean): INode | null {
	if (nodes == null) return
	if (!Array.isArray(nodes)) nodes = [nodes]
	for (const node of nodes) {
		if (callback(node)) return node
		let n = nodeFind(node.children, callback)
		if (n != null) return n
	}
	return null
}

/**
 * Cicla tutti i parent del node e per ognuno chiama il "callback"  
 * se il callback è `false` il ciclo si interrompe e restituisce il nodo  
 * se il callback non è mai `false` allora retituisce null  
 * viene analizzato anche il `node` passato come paramentro 
 * viene analizzato anche il nodo "root" 
 * @param node nodo sa vui cominciare la ricerca del PARENT
 * @param callback se questo CALLBACK restituisce (e solo se) "false" il ciclo termina e restituisce il corrente PARENT 
 */
export function nodeParents(node: INode, callback: (n: INode) => any): INode | null {
	let current = node
	while (current != null && callback(current) != false) {
		current = current.parent
	}
	return current
}
// export function nodeParents(node: INode, callback?: (n: INode) => any): INode {
// 	if (!node) return null
// 	let current = node;
// 	while (current.parent != null && (callback == null || callback(current) != false)) {
// 		current = current.parent;
// 	}
// 	return current
// }

/**
 * cicla tutti i parent di "node"
 * se "callback" return un risultato allora termina con il risultato
 * se "callback" è sempre "null" termina con "null"
 * @param node 
 * @param callback 
 * @returns 
 */
export function nodeParentsFind(node: INode, callback: (n: INode) => INode | null): INode | null {
	let current = node
	let find = null
	while (current != null && (find = callback(current)) == null) {
		current = current.parent
	}
	return find
}

/**
 * Dato un node
 * restituisce la path (assoluta) della sua posizione
 * ATTENZIONE: non è presente il nome del nodo "root"
 * @param node 
 */
export function nodePath(node: INode): string {
	if (!node) return null
	let nodes = []
	nodeParents(node, n => {
		if (n.parent != null) nodes.unshift(n.name)
	})
	return `/${nodes.join("/")}`
}

/**
 * Trasforma un node in un json 
 * usato per il debug
 * @param node 
 */
export function nodeToJson(node: INode): object {
	if (!node) return {}
	return {
		name: node.name,
		...(node instanceof NodeState ? node.state : {}),
		...(node.children?.length > 0 ? {
			children: node.children.map(c => nodeToJson(c))
		} : {})
	}
}

/**
 * Chiama ricorsivamente tutti i nodi partendo da "node"
 * Per ogni nodo chiama il "callback" 
 * e restituisce un valore che viene costruito ad albero
 * @param node 
 * @param callback 
 * @returns 
 */
export function nodeMap(node: INode, callback: CallbackNodeMap): any {
	return callback(node, () => node.children?.map(n => nodeMap(n, callback)))
}
type CallbackNodeMap = (node: INode, children: () => INode[]) => any

/**
 * Genera un id univoco
 */
export function nodeId(): string {
	const time = Date.now().toString(36)
	const rnd = Math.random().toString(36).substr(2, 5)
	return `${time}.${rnd}`
}

/**
 * Data una stringa path 
 * restituisce la funzione di uguaglianza 
 * da utilizzare per quello stesso path
 * @param pattern 
 * @returns 
 */
export function fnNodePattern(pattern: string): CallbackFnPattern {

	// by id
	if (pattern.startsWith("*")) {
		let id = pattern.slice(1)
		return (n: INode) => n.id == id

	// by classname
	} else if (pattern.startsWith("~")) {
		let className = pattern.slice(1)
		return (n: INode) => n.constructor && n.constructor.name == className

	// preleva il nodo con le caratteristiche indicate
	} else if (pattern.startsWith("{")) {
		const substr = pattern.slice(0, pattern.indexOf("}") + 1)
		const params = JSON.parse(substr)
		return (node: INode) => {
			//return node instanceof NodeState && obj.objectIsIn(params, node.state)
			return node && obj.objectIsIn(params, node["state"])
		}

	// by name
	} else {
		return (n: INode) => n.name == pattern
	}
}
type CallbackFnPattern = (n: INode) => boolean