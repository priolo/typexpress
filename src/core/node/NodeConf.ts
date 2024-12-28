import { NodeState } from "./NodeState.js";
import FarmService from "../../services/farm/index.js";
import { PathFinder } from "../path/PathFinder.js";
import { nodeForeach } from "../utils.js";
import { INode } from "./INode.js";
import { ConfActions, EventsLogsBase, TypeLog } from "./utils.js";



/**
 * Classe responsabile di:  
 * - inizializzare il NODE
 * - distruggere il NODE
 * - costruire i CHILDREN attraverso il CONF   
 */
export class NodeConf extends NodeState {

	/**
	 * Contiene le ACTIONs eseguibili
	 */
	get executablesMap() {
		return {
			...super.executablesMap,
			[ConfActions.INIT]: async () => await this.init(),
			[ConfActions.DESTROY]: async () => await this.nodeDestroy(),
		}
	}

	/**
	 * Inizializza il NODE e i suoi children
	 * */
	private async init(): Promise<void> {

		// inizializzo questo NODE prima di creare i child
		await this.onInit()

		for (const child of this.children) {
			await (<NodeConf>child).execute?.({ type: ConfActions.INIT })
		}

		await this.onInitAfter()

		// se questo nodo è il nodo "root" allora richiama ricorsivamente tutti i nodi
		// per chiamare l'evento onInitFinish
		if (this.parent == null) {
			await nodeForeach(this, async (n) => {
				await (<NodeConf>n).onInitFinish?.();
			})
		}
	}

	/**
	 * Chiamata dopo la creazione dei CHILDREN per inzializzare il nodo
	 */
	protected async onInit(): Promise<void> { }

	/**
	 * Chiamata dopo l'inizializzazione di tutti i children
	 */
	protected async onInitAfter(): Promise<void> { }

	/**
	 * Chiamata dopo l'inizializzazione di tutto l'albero
	 */
	protected async onInitFinish(): Promise<void> { }



	/**
	 * Valorizza questo NODE e costruisce tutti i children tramite il parametro JSON
	 */
	async buildByJson(json: any = {}): Promise<void> {

		// faccio una copia e tolgo "children" e "class"
		const config = { ...json }
		delete config.children
		delete config.class
		delete config.name
		// setto il config come stato iniziale
		this.setState(config)
		// se il config ha pure un "name" lo setto come identificativo del NODE
		if (json.name) this.name = json.name

		// prendo tutti i children presenti nel json e li creo
		const confChildren: any[] = (json.children ?? []).filter((child: any) => child != null)
		await this.buildChildrenByJson(confChildren)
	}

	/**
	 * Creo i children e ricorsivamente chiamo "buildByJson"
	 */
	private async buildChildrenByJson(jsonChildren: Array<any>): Promise<void> {
		for (const confChild of jsonChildren) {
			try {
				const child = await this.buildChildByJson(confChild);
				if (child == null) continue;
				this.addChild(child);
				await (<NodeConf>child).buildByJson?.(confChild);
			} catch (error) {
				this.log(EventsLogsBase.ERR_BUILD_CHILDREN, error, TypeLog.ERROR);
			}
		}
	}

	/**
	 * Dato un JSON costruisce il nodo corrispondente
	 * [II] deve prendere la "farm" piu' vicina
	 */
	private async buildChildByJson(json: any): Promise<INode | null> {
		const farm = new PathFinder(this).getNode<FarmService>("/farm")
		if (!farm) throw new Error("FarmService not found")
		return await farm.build(json)
	}

	/**
	 * Quando questo NODE deve essere distrutto
	 */
	private async nodeDestroy(): Promise<void> {
		const children = [...this.children]
		for (const child of children) {
			await (<NodeConf>child).execute?.({ type: ConfActions.DESTROY })
		}
		await this.onDestroy()
		this.parent?.removeChild(this)
	}

	/**
	 * chiamato DOPO aver distrutto i CHILDREN
	 */
	protected async onDestroy(): Promise<void> { }

}