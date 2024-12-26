import ErrorService from "../services/error/ErrorService.js";
import FarmService from "../services/farm/index.js";
import { ConfActions } from "./node/utils.js";
import { ServiceBase } from "./service/ServiceBase.js";


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
		try {
			await root.buildByJson({ children: config })
		} catch (e) {
			ErrorService.Send(root, e, "root-service:start")
		}
		await root.execute({ type: ConfActions.INIT })
		return root
	}

	/**
	 * [facility] ferma un servizio
	 */
	static async Stop(service: ServiceBase) {
		if (service) await service.execute({ type: ConfActions.DESTROY })
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
			console.debug('SIGTERM signal received: closing all services')
			await this.execute({ type: ConfActions.DESTROY })
		})
	}

	protected async onInit(): Promise<void> {
		await super.onInit()
		// se non è definito creo il gestore degli errori di default
		if (!this.children.some(child => child instanceof ErrorService)) {
			const errorSrv = new ErrorService("error")
			this.addChild(errorSrv)
			errorSrv.execute({ type: ConfActions.INIT })
		}
	}

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "root",
		}
	}

}
