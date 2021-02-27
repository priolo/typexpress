import { NodeState } from "./NodeState";
import FarmService from "../../services/farm";
import { PathFinder } from "../path/PathFinder";
import { INode } from "./INode";
import { nodeForeach } from "../utils";


export enum ConfActions {
	START = "start", 	// sostituire con "NODE_CREATE" (with config)
	STOP = "stop"		// sostituire con "NODE_DESTROY"
	// CHILDREN_ADD
}

/**
 * Classe responsabile di: 
 * memorizzare il CONF
 * costruire i CHILDREN attraverso il CONF 
 */
export class NodeConf extends NodeState {

	constructor(name?: string, conf?: any) {
		super(name)
		if (conf) this.dispatch({ type: ConfActions.START, payload: conf })
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[ConfActions.START]: async (state, payload) => await this.nodeBuild(payload),
			[ConfActions.STOP]: async (state) => await this.nodeDestroy(),
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
		const confChildren: any[] = conf.children ?? []
		//const defaultConfig = this.defaultConfig
		//if (defaultConfig.children instanceof Array) confChildren = [...confChildren, ...defaultConfig.children]
		const config = { ...this.defaultConfig, ...conf }
		delete config.children
		delete config.class
		this.setState(config)
		if (config.name) this.name = config.name

		// inizializzo questo nodo prima di creare i child
		await this.onInit()

		// se necessario creo e inserisco i children
		await this.buildChildren(confChildren)

		// inizializzo questo nodo dopo la creazione dei child
		await this.onInitAfter()

		// se questo nodo è il nodo "root" allora richiama ricorsivamente tutti i nodi
		// per chiamare l'evento onInitFinish
		if ( this.parent == null ) {
			nodeForeach(this, (n)=>{
				if ( n instanceof NodeConf ) (<NodeConf>n).onInitFinish()
			})
		}
	}
	/**
	 * Dato un array di "conf" costruisce i nodi corrispondenti
	 * e li AGGIUNGE ai children gia' esistenti
	 */
	private async buildChildren(confChildren: Array<any>): Promise<void> {
		if (confChildren == null) return
		for (let confChild of confChildren) {
			const child = await this.buildChild(confChild)
			if (child == null) continue
			this.addChild(child);
			if (child instanceof NodeConf) await child.dispatch({
				type: ConfActions.START,
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
		for (let child of this.children) {
			if (child instanceof NodeConf) await child.dispatch({
				type: ConfActions.STOP
			})
		}
		await this.onDestroy()
		this.parent?.removeChild(this)
	}

	/**
	 * Chiamata PRIMA della creazione dei CHILDREN
	 */
	protected async onInit(): Promise<void> { }

	/**
	 * Chiamata DOPO la creazione dei CHILDREN
	 */
	protected async onInitAfter(): Promise<void> { }

	/**
	 * Chiamata DOPO la creazione di tutti i children
	 */
	protected async onInitFinish(): Promise<void> { }

	/**
	 * chiamato DOPO aver distrutto i CHILDREN
	 */
	protected async onDestroy(): Promise<void> { }

}