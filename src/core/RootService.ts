import { ServiceBase } from "./service/ServiceBase"
import FarmService from "../services/farm"
import { ConfActions } from "./node/utils"
import ErrorService from "../services/error"
import { PathFinder } from "./path/PathFinder"


/**
 * E' il nodo radice
 * - Permette il bootstap dell'applicazione 
 * - Contiene i Services
 * - Di default ha il service "farm"
 */
export class RootService extends ServiceBase {

	// [facility]: crea e avvia un json
	static async Start(config: any): Promise<RootService> {
		if (!Array.isArray(config)) config = [config]
		const root = new RootService()
		await root.dispatch({
			type: ConfActions.START,
			payload: {
				children: config
			}
		})
		return root
	}

	// [facility] ferma un servizio
	static async Stop(service: ServiceBase) {
		if (service) await service.dispatch({ type: ConfActions.STOP })
	}

	constructor(name: string = "root") {
		super(name)

		// add farm service
		const farm = new FarmService()
		this.addChild(farm)

		// se non c'e' gia' inserisco il gestore di errori di default
		// if ( !new PathFinder(this).path("/error").exists() ) {
		// 	const error = new ErrorService()
		// 	error.dispatch({ type: ConfActions.START })
		// 	this.addChild(error)
		// }

		// [II] TO DO logService

		// nel caso in cui l'app venga chiusa
		process.on('SIGTERM', async () => {
			console.debug('SIGTERM signal received: closing HTTP server')
			await this.dispatch({ type: ConfActions.STOP })
		})
	}

	protected override async onInit(conf: any): Promise<void> {
		await super.onInit(conf)
		// se non è definito creo il gestore degli errori di default
		if (!conf.children.some(child => child.class == "error")) {
			const errorSrv = new ErrorService()
			errorSrv.dispatch({ type: ConfActions.START })
			this.addChild(errorSrv)
		}
	}

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "root",
		}
	}

}