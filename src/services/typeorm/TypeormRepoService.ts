import { RepoRestActions } from "../../core/repo/utils";
import { TypeormRepoBaseService } from "./TypeormRepoBaseService";



/**
 * Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
 */
export class TypeormRepoService extends TypeormRepoBaseService {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			// https://typeorm.io/#/find-options
			// opzione da usare in "ALL", Per esempio se il risultato deve comprendere anche delle relazioni:
			// findOptions: { relations: ["documents"] },
			findOptions: null,			
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[RepoRestActions.SAVE]: async (state, entity) => {
				const repo = this.getRepo()
				return await repo.save(entity);
			},
			[RepoRestActions.ALL]: async (state) => {
				const { findOptions } = state
				const repo = this.getRepo()
				return await repo.find(findOptions);
			},
			[RepoRestActions.GET_BY_ID]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.findOne(id) ?? null;
			},
			[RepoRestActions.DELETE]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.delete(id);
			},
		}
	}

}