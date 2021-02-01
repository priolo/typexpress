import { Repository, Connection } from "typeorm";
import { ServiceBase } from "../../core/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder";
import { TypeormService } from "./TypeormService";
import { RepoRestActions } from "../../core/RepoRestActions";


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
			}
		}
	}

	protected get connection(): Connection {
		const ts = new PathFinder(this).getNode<TypeormService>("..")
		return ts.connection
	}

	protected getRepo(model?: string): Repository<unknown> {
		if ( !model ) {
			model = typeof this.state.model=="object"?this.state.model?.name:this.state.model
		}
		const repo = this.connection.getRepository(model)
		return repo
	}

}