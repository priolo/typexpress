/**
 * Definisce la struttura ad albero dei Node
 */
 export interface INode {

	/**
	 * random identifier of the node
	 */
	id:string
	/**
	 * node name. It is also used by the pathfiend
	 */
	name:string

	parent:INode | null

	readonly children:INode[]

	addChild(child: INode): void

	removeChild(child: INode): void

	indexChild(child: INode): number
	
}