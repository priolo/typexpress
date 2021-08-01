
export enum RepoTreeActions {
	GET_CHILDREN = "get-children",
	GET_ROOTS = "get-roots"
}

export enum RepoStructActions {
	/** permette di specificare un array di action dirette al repository */
	SEED = "seed",
	/** cancella i dati di una tabella disattivando le foregn keys */
	TRUNCATE = "truncate",
	/** cancella i dati di una tabella */
	CLEAR = "clear",
}

export enum RepoRestActions {
	ALL = "all",
	GET_BY_ID = "getById",
	SAVE = "save",
	DELETE = "delete",
}

export interface IRepoStructActions<T> {
	[RepoStructActions.SEED]: (state:any, values:T[]) => Promise<void>,
}

export interface IRepoRestDispatch<T> {
	[RepoRestActions.ALL]: (state:any) => Promise<T[]>,

	[RepoRestActions.GET_BY_ID]: (state:any, id:string|number) => Promise<T>,

	[RepoRestActions.SAVE]: (state:any, entity:any) => Promise<T>,

	[RepoRestActions.DELETE]: (state:any, id:string|number) => Promise<any>,
}
