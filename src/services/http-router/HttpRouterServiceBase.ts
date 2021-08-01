import { ServiceBase } from "../../core/service/ServiceBase";
import { PathFinder } from "../../core/path/PathFinder";
import express, { Router } from "express";
import { IHttpRouter } from "../http/utils";
import cors from "cors"

/**
 * Si attacca al PARENT (deve implementare IHttpRouter) come ROUTER
 */
export abstract class HttpRouterServiceBase extends ServiceBase implements IHttpRouter {

	private router: Router = null

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			//headers: {"accept":"json"}				// https://expressjs.com/en/4x/api.html#req.accepts
			cors: null,									// http://expressjs.com/en/resources/middleware/cors.html#configuration-options
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
		const { headers, cors: corsOptions } = this.state
		const router = express.Router()

		// se c'e' un vincolo di "accept" allora lo utilizzo
		if (headers) {
			router.use((req, res, next) => {
				const chkHeaders = Object.keys(req.headers).some(k => {
					const value = headers[k.toLocaleLowerCase()]
					return (req.headers[k] as string).toLowerCase().indexOf(value) != -1
				})
				next(!chkHeaders ? "router" : undefined)
			})
		}

		// se c'e' un "cors options" lo applico
		if (corsOptions) {
			router.use(cors(corsOptions))
		}

		return router
	}

	use(router: Router, path: string = "/"): void {
		this.router.use(path, router)
	}

}
