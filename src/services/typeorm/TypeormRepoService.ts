import { IRepoRestDispatch, RepoRestActions } from "../../core/repo/utils";
import { TypeormRepoBaseService } from "./TypeormRepoBaseService";



/**
 * Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
 */
export class TypeormRepoService extends TypeormRepoBaseService {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			// https://typeorm.io/#/find-options
			// opzione da usare in "ALL", Per esempio se il risultato deve comprendere anche delle relazioni:
			// findOptions: { relations: ["documents"] },
			findOptions: null,
		}
	}

	get dispatchMap(): any {
		return <IRepoRestDispatch<any>>{
			...super.dispatchMap,
			[RepoRestActions.SAVE]: async (_, entity) => {
				const repo = this.getRepo()
				return await repo.save(entity);
			},
			[RepoRestActions.ALL]: async (state) => {
				const { findOptions } = state
				const repo = this.getRepo()
				return await repo.find(findOptions);
			},
			[RepoRestActions.GET_BY_ID]: async (_, id) => {
				const repo = this.getRepo()
				return await repo.findOne({ where: { id } }) ?? null;
			},
			[RepoRestActions.DELETE]: async (_, id) => {
				const repo = this.getRepo()
				//await this.connection.query('PRAGMA foreign_keys=OFF');
				const ret = await repo.delete(id);
				//await this.connection.query('PRAGMA foreign_keys=ON');
				return ret
			},
		}
	}

}