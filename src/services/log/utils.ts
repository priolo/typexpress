
export enum Actions {
	LOG = "log"
}

export enum LogLevel {
	ERROR = "error",
	WARN = "warn",
	INFO = "info",
	HTTP = "http",
	VERBOSE = "verbose",
	DEBUG = "debug",
	SILLY = "silly",
}

export interface LogNotify {
	level?: LogLevel,
	message: string,
}
