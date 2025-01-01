import ErrorService from "../services/error/ErrorService.js";
import FarmService from "../services/farm/index.js";
import { ConfActions } from "./node/types.js";
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
		debugger
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

		// nel caso in cui l'app venga chiusa
		process.on('SIGTERM', async () => {
			console.debug('SIGTERM signal received: closing all services')
			await this.execute({ type: ConfActions.DESTROY })
		})
	}

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "root",
		}
	}

}
