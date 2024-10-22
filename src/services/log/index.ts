import LogService from "./LogService.js"
import FileService from "./transport/FileService.js"
import ConsoleService from "./transport/ConsoleService.js"

export {
	LogService as default,
	LogService as Service,
	FileService as file,
	ConsoleService as console
}

export * from "./utils.js"