import { NodeState } from "../node/NodeState.js";

/**
 *  Oggetto mandato al LISTENER quando c'e' un EVENT
 * */
export interface IChildLog {
	/** NODE-TARGET dove è stato creato l'evento */
	source: string,
	/** NODE deove è stato creato l'evento */
	target?: NodeState,
	/** EVENT-NAME dell'evento avvenuto*/
	name: string,
	/** dati specifici dell'EVENT*/
	payload?: any,
}

/**
 * EVENT-NAME che si possono ascoltare di un oggetto "ServiceBase"
 */
export enum ServiceBaseLogs {
	/** quando lo STATE del NODE cambia */
	STATE_CHANGE = "state:change",
	/** quando il NODE è inizializzato */
	INIT = "node:init",
	INIT_AFTER = "node:init-after",
	DESTROY = "node:destroy",
	DISPATCH = "node:dispatch"
}

/**
 * Gli errori gestiti da questo servizio
 */
export enum Errors {
	INIT = "base:init"
}

//#region REPO-BASE

/**
 * ACTION per oggetti REPO-BASE
 */
export enum RepoStructActions {
	/** permette di specificare un array di action dirette al repository */
	SEED = "seed",
	/** cancella i dati di una tabella disattivando le foregn keys */
	TRUNCATE = "truncate",
	/** cancella i dati di una tabella */
	CLEAR = "clear"
}

/**
 * identifica un set di DISPATCH per un oggetto REPO
 * per esempio "TypeormRepoBaseService"
 */
export interface IRepoStructActions<T> {
	[RepoStructActions.SEED]: (values: T[]) => Promise<void>;
}

/**
 * ACTIONS per oggetti REPO-REST
 * che si possono fare ad un "IRepoRestDispatch"
 */
export enum RepoRestActions {
	ALL = "all",
	GET_BY_ID = "getById",
	SAVE = "save",
	DELETE = "delete"
}

/**
 * identifica un set di DISPATCH per un oggetto REST
 * adatto all'oggetto "TypeormRepoService"
 */
export interface IRepoRestDispatch<T> {
	[RepoRestActions.ALL]: () => Promise<T[]>;

	[RepoRestActions.GET_BY_ID]: (id: string | number) => Promise<T>;

	[RepoRestActions.SAVE]: (entity: any) => Promise<T>;

	[RepoRestActions.DELETE]: (id: string | number) => Promise<any>;
}

/**
 * ACTIONS per oggetti REPO-TREE
 */
export enum RepoTreeActions {
	GET_CHILDREN = "get-children",
	GET_ROOTS = "get-roots"
}

//#endregion