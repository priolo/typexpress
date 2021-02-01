
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

const LOG_OPTION_STYLE = [
	LOG_CMM.FgGreen,
	LOG_CMM.FgYellow,
	LOG_CMM.FgRed,
]

const LOG_OPTION_LABEL = [
	"DEBUG: ",
	"WARNING: ",
	"ERROR: "
]

export const LOG_OPTION = {
	DEBUG: 0,
	WARNING: 1,
	ERROR: 2,
}

export function log ( message, type, param=null ) {
	if ( LogOptions.enabled == false ) return;
	//console.log ( `%c${LOG_OPTION_LABEL[type]}${message}`,LOG_OPTION_STYLE[type]);
	console.log( `${LOG_OPTION_STYLE[type]}${LOG_OPTION_LABEL[type]}${LOG_CMM.Reset}${message}` );
	if ( param!=null ) console.log ( param );
}

export let LogOptions = { 
	enabled: true 
};