import { RepoStructActions } from "./RepoStructActions";


export interface IRepoStructActions<T> {
	[RepoStructActions.DROP]: (state:any, entity:any) => Promise<void>,

	[RepoStructActions.DROP_ALL]: (state:any) => Promise<void>,

	[RepoStructActions.SEED]: (state:any, values:T[]) => Promise<void>,
}
