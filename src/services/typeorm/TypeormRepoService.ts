import { RepoRestActions } from "../../core/repo/RepoRestActions";
import { TypeormRepoBaseService } from "./TypeormRepoBaseService";





/**
 * Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
 */
export class TypeormRepoService extends TypeormRepoBaseService {
	
	get dispatchMap(): any {
		return {
			...super.dispatchMap,
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
		}
	}

}