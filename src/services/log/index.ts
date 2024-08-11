import LogService from "./LogService"
import FileService from "./transport/FileService"
import ConsoleService from "./transport/ConsoleService"

export {
	LogService as default,
	LogService as Service,
	FileService as file,
	ConsoleService as console
}

export * from "./utils"