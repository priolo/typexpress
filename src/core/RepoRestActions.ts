
export enum RepoRestActions {
	ALL = "all",
	GET_BY_ID = "getById",
	SAVE = "save",
	DELETE = "delete",
}

export interface IRepoRestDispatch<T> {
	[RepoRestActions.ALL]: (state:any) => Promise<T[]>,

	[RepoRestActions.GET_BY_ID]: (state:any, id:string|number) => Promise<T>,

	[RepoRestActions.SAVE]: (state:any, entity:any) => Promise<T>,

	[RepoRestActions.DELETE]: (state:any, id:string|number) => Promise<any>,
}

//export const RepoAllAction = ()=> ({ type: RepoRestActions.ALL, payload: null})

//export const RepoGetByIdAction = (id:)=> ({ type: RepoRestActions.ALL, payload: null})
