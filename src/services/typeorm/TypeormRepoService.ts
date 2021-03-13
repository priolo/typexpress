import { Repository, Connection } from "typeorm";
import { ServiceBase } from "../../core/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder";
import { TypeormService } from "./TypeormService";
import { RepoRestActions } from "../../core/repo/RepoRestActions";
import { RepoStructActions } from "../../core/repo/RepoStructActions";



export enum TypeormActions {
	FIND = "find",
}


/**
 * Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
 */
export class TypeormRepoService extends ServiceBase {

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
			[RepoRestActions.SAVE]: async (state, entity) => {
				const repo = this.getRepo()
				return await repo.save(entity);
			},
			[RepoRestActions.ALL]: async (state) => {
				const repo = this.getRepo()
				return await repo.find();
			},
			[RepoRestActions.GET_BY_ID]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.findOne(id) ?? null;
			},
			[RepoRestActions.DELETE]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.delete(id);
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

	/**
	 * Restituiesce il "Repository" nativo typeorm di questo nodo
	 * @param model 
	 * @returns 
	 */
	protected getRepo(model?: string): Repository<unknown> {
		if (!model) {
			model = typeof this.state.model == "object" ? this.state.model?.name : this.state.model
		}
		const repo = this.connection.getRepository(model)
		return repo
	}

	protected async onInitFinish(): Promise<void> {
		await super.onInitFinish()
		const { seeds } = this.state
		this.seed(seeds)
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