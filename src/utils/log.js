
// const LOG_OPTION_STYLE = [
// 	"background: azure; color: black",
// 	"background: yellow; color: black",
// 	"background: red; color: black"
// ]

const LOG_CMM = {
	Reset: "\x1b[0m",
	Bright: "\x1b[1m",
	Dim: "\x1b[2m",
	Underscore: "\x1b[4m",
	Blink: "\x1b[5m",
	Reverse: "\x1b[7m",
	Hidden: "\x1b[8m",

	FgBlack: "\x1b[30m",
	FgRed: "\x1b[31m",
	FgGreen: "\x1b[32m",
	FgYellow: "\x1b[33m",
	FgBlue: "\x1b[34m",
	FgMagenta: "\x1b[35m",
	FgCyan: "\x1b[36m",
	FgWhite: "\x1b[37m",

	BgBlack: "\x1b[40m",
	BgRed: "\x1b[41m",
	BgGreen: "\x1b[42m",
	BgYellow: "\x1b[43m",
	BgBlue: "\x1b[44m",
	BgMagenta: "\x1b[45m",
	BgCyan: "\x1b[46m",
	BgWhite: "\x1b[47m",
}

const LOG_TYPE_STYLE = [
	LOG_CMM.FgGreen,
	LOG_CMM.FgBlue,
	LOG_CMM.FgYellow,
	LOG_CMM.FgRed,
]

const LOG_TYPE_LABEL = [
	"DEBUG: ",
	"INFO: ",
	"WARNING: ",
	"ERROR: "
]

export const LOG_TYPE = {
	DEBUG: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3,
}

export const LOG_LEVEL = {
	PROD: 0,
	DEV: 1,
	DEBUG: 3,
}


export function log(message, type, param = null) {
	if (log.options.level == LOG_LEVEL.PROD) return
	if (log.options.level == LOG_LEVEL.DEV && type == LOG_TYPE.DEBUG) return

	//console.log ( `%c${LOG_OPTION_LABEL[type]}${message}`,LOG_OPTION_STYLE[type]);
	console.log(`${LOG_TYPE_STYLE[type]}${LOG_TYPE_LABEL[type]}${LOG_CMM.Reset}${message}`);
	if (param != null) {
		console.log(param)
	}
}
log.options = {
	level: LOG_LEVEL.DEV
}

