
export class ErrorNotify extends Error {
	constructor ( code: string | Error, path?:string, level:string=ErrorLevel.ERROR ) {
		super(code instanceof Error ? code.message : code)
		this.sender = path
		this.level = level
	}
	sender: string
	level: string
}

export enum ErrorLevel {
	WARNING = "warning",
	PROBLEM = "problem",
	ERROR = "error",
	ALARM = "alarm"
}