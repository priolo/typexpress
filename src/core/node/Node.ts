import { PathFinder } from "../path/PathFinder.js";
import { nodeId } from "../utils.js";
import { INode } from "./INode.js";



/**
 * Classe responsabile di mantenere la struttura ad albero
 */
export class Node implements INode {

	constructor ( name:string="node" ) {
		this.name = name
	}

	id:string = nodeId()

	name:string

	parent: INode | null = null

	get children(): INode[] {
		return this._children;
	}
	protected _children: INode[] = [];

	addChild(child: INode): void {
		if (child == null) throw new Error("ivalid parameter")
		this._children.push(child)
		child.parent = this
	}

	removeChild(child: INode | number): void {
		const index = typeof child!="number" ? this.indexChild(child) : child
		if (index == -1) return;
		this._children.splice(index, 1)
			.forEach(n=>n.parent=null)
	}

	private indexChild(child: INode): number {
		if (child == null) return -1
		return this._children.indexOf(child)
	}

	/**
	 * [facility]: restituisce un NODE-CHILD tramite la PATH
	 * */
	getChild(path: string): INode | null {
		return new PathFinder(this).getNode(path)
	}

}