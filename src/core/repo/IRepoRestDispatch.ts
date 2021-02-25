import { RepoRestActions } from "./RepoRestActions";


export interface IRepoRestDispatch<T> {
	[RepoRestActions.ALL]: (state:any) => Promise<T[]>,

	[RepoRestActions.GET_BY_ID]: (state:any, id:string|number) => Promise<T>,

	[RepoRestActions.SAVE]: (state:any, entity:any) => Promise<T>,

	[RepoRestActions.DELETE]: (state:any, id:string|number) => Promise<any>,
}
