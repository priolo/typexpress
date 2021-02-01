import { INode } from "./node/INode"


export function nodeForeach(nodes: INode | INode[], callback: (n: INode) => void): void {
	if (nodes == null) return
	if (!Array.isArray(nodes)) nodes = [nodes]
	for (const node of nodes) {
		callback(node)
		nodeForeach(node.children, callback)
	}
}

export function nodeFind(nodes: INode | INode[], callback: (n: INode) => boolean): INode | null {
	if (nodes == null) return
	if (!Array.isArray(nodes)) nodes = [nodes]
	for (const node of nodes) {
		if ( callback(node) ) return node
		let n = nodeFind(node.children, callback)
		if ( n != null) return n
	}
	return null
}

export function nodeToJson(node: INode): object {
	if ( !node ) return {}
	return {
		id: node.id,
		name: node.name,
		children: node.children.map(c => nodeToJson(c))
	}
}

export function nodeMap(node: INode, callback: CallbackNodeMap): any {
	return callback(node, () => node.children?.map(n => nodeMap(n, callback)))
}

type CallbackNodeMap = (node: INode, children: () => INode[]) => any

export function nodeId(): string {
	const time = Date.now().toString(36)
	const rnd = Math.random().toString(36).substr(2, 5)
	return `${time}.${rnd}`
}