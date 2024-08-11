import cors from "cors";
import express, { Router } from "express";
import { PathFinder, ServiceBase } from "../../index";
import { IHttpRouter } from "../http/utils";
import { NodeStateConf } from "../../core/node/NodeState";



// export interface HttpRouterServiceBaseConf extends NodeStateConf {
// 	/** OUTING relativo a questo NODE */
// 	path: string
// 	/** https://expressjs.com/en/4x/api.html#req.accepts */
// 	headers: {[key:string]:string}
// 	/** http://expressjs.com/en/resources/middleware/cors.html#configuration-options */
// 	cors: any	
// }

export type HttpRouterServiceBaseConf = Partial<HttpRouterServiceBase['stateDefault']>

/**
 * Si attacca al PARENT (deve implementare IHttpRouter) come ROUTER
 */
export abstract class HttpRouterServiceBase extends ServiceBase implements IHttpRouter {

	private router: Router = null

	get stateDefault() {
		return {
			...super.stateDefault,
			headers: <{[key:string]:string}>null,
			cors: <any>null,		
			path: "/",
		}
	}

	protected async onInit(): Promise<void> {
		await super.onInit()
		const parent = new PathFinder(this).getNode<IHttpRouter>("..")
		this.router = this.onBuildRouter()
		parent.use(this.router, this.state.path)
	}

	protected async onDestroy(): Promise<void> {
		await super.onDestroy()
		this.router = null
	}

	protected onBuildRouter(): Router {
		const router = express.Router()

		// se c'e' un vincolo di "accept" allora lo utilizzo
		if (this.state.headers) {
			router.use((req, res, next) => {
				const chkHeaders = Object.keys(req.headers).some(k => {
					const value = this.state.headers[k.toLocaleLowerCase()]
					return (req.headers[k] as string).toLowerCase().indexOf(value) != -1
				})
				next(!chkHeaders ? "router" : undefined)
			})
		}

		// se c'e' un "cors options" lo applico
		if (this.state.cors) {
			router.use(cors(this.state.cors))
		}

		return router
	}

	use(router: Router, path: string = "/"): void {
		this.router.use(path, router)
	}

}
