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

	/**
	 * NODE che contiene questo NODE. Se null è alla radice dell'albero
	 */
	parent:INode | null

	/**
	 * NODES contenuti da questo NODE
	 */
	readonly children:INode[]

	/**
	 * Aggiunge un NODE come figlio di questo NODE
	 */
	addChild(child: INode): void

	/**
	 * Rimuove un NODE figlio di questo NODE
	 */
	removeChild(child: INode): void
	
}