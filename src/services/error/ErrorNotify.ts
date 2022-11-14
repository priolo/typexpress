

/**
 * Errore custom.
 * Permette di memorizzare anche il PATH del node sender e ErrorLevel
 */
export class ErrorNotify extends Error {
	constructor(error: Error | string, code?: string, level: string = ErrorLevel.ERROR) {
		super(error instanceof Error ? error.message : error)
		this.code = code ?? this.message
		this.level = level
	}
	code: string
	level: string
}

export enum ErrorLevel {
	WARNING = "warning",
	PROBLEM = "problem",
	ERROR = "error",
	ALARM = "alarm"
}