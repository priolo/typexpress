import { HttpRouterRestServiceBase } from "./HttpRouterRestServiceBase"
import { Bus } from "../../../core/path/Bus"
import { RepoRestActions } from "../../../core/repo/RepoRestActions"

/**
 * Collega un ROUTE con un REPO 
 * ed espone dei metodi per il REST
 */
export class HttpRouterRestRepoService extends HttpRouterRestServiceBase {

    get defaultConfig(): any {
        return {
            ...super.defaultConfig,
            name: "route-rest-repo",
            repository: "",
        }
    }

    protected async getAll(): Promise<any[]> {
        const { repository } = this.state
        return await new Bus(this, repository).dispatch({
            type: RepoRestActions.ALL
        })
    }

    protected async getById(id: string): Promise<any> {
        const { repository } = this.state
        return await new Bus(this, repository).dispatch({
            type: RepoRestActions.GET_BY_ID,
            payload: id
        })
    }

    protected async save(entity: any): Promise<any> {
        const { repository } = this.state
        return await new Bus(this, repository).dispatch({
            type: RepoRestActions.SAVE,
            payload: entity
        })
    }

    protected async delete(id: string): Promise<any> {
        const { repository } = this.state
        return await new Bus(this, repository).dispatch({
            type: RepoRestActions.DELETE,
            payload: id
        })
    }
}