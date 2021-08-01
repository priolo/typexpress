export enum ErrorServiceActions {
	NOTIFY = "notify"
}

export interface Error {
	code:string,
	error?: any,
}