
/**
 * Definisce la struttura ad albero dei Node
 */
export interface INode {
	
	id:string

	name:string

	parent:INode | null

	readonly children:INode[]

	addChild(child: INode): void

	removeChild(child: INode): void

	indexChild(child: INode): number
	
}
