import { ServiceBase } from "./ServiceBase"
import FarmService from "../services/farm"
import { ConfActions } from "./node/NodeConf"


/**
 * E' il nodo radice
 * Permette il bootstap dell'applicazione e contiene i Services
 * Di default ha il service "farm"
 */
export class RootService extends ServiceBase {

	constructor(name: string = "root") {
		super(name)
		this.addChild(new FarmService())
		
		process.on('SIGTERM', async () => {
			console.debug('SIGTERM signal received: closing HTTP server')
			await this.dispatch({ type: ConfActions.STOP })
		})
	}

	get defaultConfig():any { return { ...super.defaultConfig,
		name: "root",
	}}

}