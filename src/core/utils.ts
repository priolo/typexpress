import { INode } from "./node/INode"

/**
 * Cicla ricorsivamente tutti i nodi e chiama per ognuno il "callback"
 * @param nodes 
 * @param callback 
 */
export function nodeForeach(nodes: INode | INode[], callback: (n: INode) => void): void {
	if (nodes == null) return
	if (!Array.isArray(nodes)) nodes = [nodes]
	for (const node of nodes) {
		callback(node)
		nodeForeach(node.children, callback)
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
 * Cicla tutti i parent del node
 * per ognuno chiama il "callback"
 * se e solo se il callback retituisce false il ciclo si interrompe
 * restituisce l'ultimo node analizzato
 * @param node 
 * @param callback 
 */
export function nodeParents(node: INode, callback?: (n: INode) => any): INode {
	if ( !node ) return null
	let current = node;
	while (current.parent != null && (callback==null || callback(current)!=false)) {
		current = current.parent;
	}
	return current
}

/**
 * Dato un node
 * restituisce la path (assoluta) della sua posizione
 * @param node 
 */
export function nodePath(node:INode) : string {
	if ( !node ) return null
	let nodes = []
	nodeParents(node, (n)=>nodes.unshift(n.name))
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
		//id: node.id,
		name: node.name,
		children: node.children.map(c => nodeToJson(c))
	}
}

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