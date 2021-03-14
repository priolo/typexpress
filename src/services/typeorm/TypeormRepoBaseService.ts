import { Repository, Connection, TreeRepository } from "typeorm";
import { ServiceBase } from "../../core/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder";
import { TypeormService } from "./TypeormService";
import { RepoStructActions } from "../../core/repo/RepoStructActions";


export enum TypeormActions {
	/**
	 * Ricerca con una query typeorm  
	 * https://typeorm.io/#/find-options
	 */
	FIND = "find",
}



/**
 * [ABSTRACT] Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
https://typeorm.io/#/separating-entity-definition
https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html#cascade
 */
export abstract class TypeormRepoBaseService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			model: null, // string:mandatory:MODEL di riferimento per questo REPO
			seeds: null, // indica le action da fare su questo REPO
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[TypeormActions.FIND]: async (state, query) => {
				const repo = this.getRepo()
				return await repo.find(query)
			},
			[RepoStructActions.SEED]: async (state, seeds) => this.seed(seeds),
			[RepoStructActions.TRUNCATE]: async (state) => this.truncate()
		}
	}

	/**
	 * Restituisce la "Connection" nativa typeorm
	 */
	protected get connection(): Connection {
		const ts = new PathFinder(this).getNode<TypeormService>("..")
		return ts.connection
	}

	protected get model(): any {
		return typeof this.state.model == "object" ? this.state.model?.name : this.state.model
	}

	/**
	 * Restituiesce il "Repository" nativo typeorm di questo nodo
	 * @param model 
	 * @returns 
	 */
	protected getRepo(model?: string): Repository<unknown> {
		const repo = this.connection.getRepository(model ?? this.model)
		return repo
	}

	

	protected async onInitFinish(): Promise<void> {
		await super.onInitFinish()
		const { seeds } = this.state
		await this.seed(seeds)
	}

	private async seed(seeds:Array<any>): Promise<void> {
		if (!Array.isArray(seeds)) return
		const repo = this.getRepo()

		for (const seed of seeds) {
			// is a string maybe SQL?
			if (typeof seed == "string") {
				await repo.query(seed)
				continue
			}

			// is a Action
			if ( seed.type ) {
				await this.dispatch(seed)
				continue
			}

			// is object... maybe Entity?
			await repo.save(seed)
		}
	}

	private async truncate():Promise<void> {
		const repo = this.getRepo()
		const qr = this.connection.createQueryRunner()
		await qr.clearTable(repo.metadata.tableName)
	}

}