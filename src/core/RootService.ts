import { ServiceBase } from "./ServiceBase"
import FarmService from "../services/farm"
import { ConfActions } from "./node/NodeConf"
import { EmitterService } from "services/notifier/EmitterService"


/**
 * E' il nodo radice
 * - Permette il bootstap dell'applicazione 
 * - Contiene i Services
 * - Di default ha il service "farm"
 */
export class RootService extends ServiceBase {

	// [facility]: crea e avvia un json
	static async Start ( config:any ): Promise<RootService> {
		if ( !Array.isArray(config)) config = [config]
		const root = new RootService()
		await root.dispatch({
			type: ConfActions.START,
			payload: { 
				children: config
			}
		})
		return root
	}

	constructor(name: string = "root") {
		super(name)

		// services base
		this.addChild(new FarmService())
		this.addChild(new EmitterService())

		// nel caso in cui l'app venga chiusa
		process.on('SIGTERM', async () => {
			console.debug('SIGTERM signal received: closing HTTP server')
			await this.dispatch({ type: ConfActions.STOP })
		})
	}
	
	get defaultConfig():any { return { ...super.defaultConfig,
		name: "root",
	}}

}