import { NodeState } from "./NodeState";
import FarmService from "../../services/farm";
import { PathFinder } from "../path/PathFinder";
import { ConfActions } from "./utils";
import { INode } from "./INode"
import { nodeForeach } from "../utils";



/**
 * Classe responsabile di:  
 * - memorizzare il CONF  
 * - costruire i CHILDREN attraverso il CONF   
 */
export class NodeConf extends NodeState {

	constructor(name?: string, conf?: any) {
		super(name)
		if (conf) this.dispatch({ type: ConfActions.CREATE, payload: conf })
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ConfActions.CREATE]: async (state, payload) => await this.nodeBuild(payload),
			[ConfActions.DESTROY]: async (state) => await this.nodeDestroy(),
		}
	}

	/**
	 * il config di default che viene mergiato con il config di istanza
	 */
	get defaultConfig(): any {
		return {}
	}

	/**
	 * Quando questo NODE deve essere costruito 
	 * @param conf 
	 */
	private async nodeBuild(conf: any = {}): Promise<void> {

		// tutti i children presenti nel config
		const confChildren: any[] = (conf.children ?? []).filter(child => child != null)
		// merge valori di default del nodo (this.defaultConfig) e quelli passati come parametro (conf) 
		// pero' togliendo "children" e "class"
		const config = { ...this.defaultConfig, ...conf }
		delete config.children
		delete config.class
		// setto il config come stato iniziale
		this.setState(config)
		// se il config ha pure un "name" lo setto come identificativo del NODE
		if (config.name) this.name = config.name

		// inizializzo questo nodo prima di creare i child
		await this.onInit(conf)

		// se necessario creo e inserisco i children
		await this.buildChildren(confChildren)

		// inizializzo questo nodo dopo la creazione dei child
		await this.onInitAfter()

		// se questo nodo è il nodo "root" allora richiama ricorsivamente tutti i nodi
		// per chiamare l'evento onInitFinish
		if (this.parent == null) {
			await nodeForeach(this, async (n) => {
				if (n instanceof NodeConf) await (<NodeConf>n).onInitFinish()
			})
		}
	}

	/**
	 * Dato un array di "conf" costruisce i nodi corrispondenti
	 * e li AGGIUNGE ai children gia' esistenti
	 */
	private async buildChildren(confChildren: Array<any>): Promise<void> {
		if (confChildren == null) return
		for (const confChild of confChildren) {
			const child = await this.buildChild(confChild)
			if (child == null) continue
			this.addChild(child);
			if (child instanceof NodeConf) await child.dispatch({
				type: ConfActions.CREATE,
				payload: confChild,
			})
		}
	}
	
	/**
	 * Dato un "conf" costruisce il nodo corrispondente
	 */
	private async buildChild(conf: any): Promise<INode | null> {
		const farm = new PathFinder(this).getNode<FarmService>("/farm")
		return await farm.build(conf)
	}

	/**
	 * Quando questo NODE deve essere distrutto
	 */
	private async nodeDestroy(): Promise<void> {
		const children = [...this.children]
		for (const child of children) {
			if (child instanceof NodeConf) await child.dispatch({
				type: ConfActions.DESTROY
			})
		}
		await this.onDestroy()
		this.parent?.removeChild(this)
	}

	/**
	 * Chiamata PRIMA della creazione dei CHILDREN
	 */
	protected async onInit(conf:any): Promise<void> { }

	/**
	 * Chiamata DOPO la creazione dei CHILDREN
	 */
	protected async onInitAfter(): Promise<void> { }

	/**
	 * Chiamata DOPO la creazione di tutti i children della ROOT
	 */
	protected async onInitFinish(): Promise<void> { }

	/**
	 * chiamato DOPO aver distrutto i CHILDREN
	 */
	protected async onDestroy(): Promise<void> { }

}