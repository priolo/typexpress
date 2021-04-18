import { RepoStructActions } from "./RepoStructActions";


export interface IRepoStructActions<T> {
	[RepoStructActions.SEED]: (state:any, values:T[]) => Promise<void>,
}
