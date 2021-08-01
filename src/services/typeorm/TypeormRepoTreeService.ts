import { TreeRepository } from "typeorm";
import { RepoTreeActions } from "../../core/repo/utils";
import { TypeormRepoService } from "./TypeormRepoService";




/**
 * Rappresente un REPO di uno specifico MODEL
 * di TYPEORM
 * https://typeorm.io/#/tree-entities/working-with-tree-entities
 */
export class TypeormRepoTreeService extends TypeormRepoService {
	
	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[RepoTreeActions.GET_CHILDREN]: async (state, entity) => {
				const repo = this.getTree().findDescendantsTree(entity)
				return await repo
			},
			[RepoTreeActions.GET_ROOTS]: async (state, entity) => {
				const repo = this.getTree().findRoots()
				return await repo
			},
		}
	}

	/**
	 * Restituiesce il "Repository" nativo typeorm di questo nodo
	 * @param model 
	 * @returns 
	 */
	 protected getTree(model?: string): TreeRepository<unknown> {
		const repo = this.connection.getTreeRepository(model ?? this.model)
		return repo
	}

}