import { IAction } from "../../core/node/IAction"
import { ErrorNotify } from "./ErrorNotify"



export enum Actions {
	/** 
	 * si tratta di una notifica che è avvenuto un errore 
	 * payload(:Error)
	 * */
	NOTIFY = "notify"
}

export interface NotifyAction extends IAction {
	type: Actions.NOTIFY
	payload: ErrorNotify
}

export enum ErrorLevel {
	WARNING = "warning",
	PROBLEM = "problem",
	ERROR = "error",
	ALARM = "alarm"
}
