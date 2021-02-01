
import express, { Request, Response, Router } from "express";
import { runInNewContext } from "vm";
import { log, LOG_OPTION } from "../../utils/log";
import { HttpRouterServiceBase } from "./HttpRouterServiceBase";

/**
 * Mappa una richiesta http rest
 * con le funzioni appropriate della classe
 */
export class HttpRouterService extends HttpRouterServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "route",
			//headers: {"accept":"json"}				// https://expressjs.com/en/4x/api.html#req.accepts
			routers: [ /*
				{
					path: "/test", 						// string:default:"/"
					verb: "get|post|put|delete|...", 	// string:default:"get"
					method: "test"						// string|(req,res,next)=>any
				}
			*/]
		}
	}


	protected onBuildRouter(): Router {
		//super.onBuildRouter()
		const { routers, headers } = this.state
		const router = express.Router()

		// se c'e' un vincolo di "accpts" allora lo utilizzo
		if ( headers ) {
			router.use ( (req,res,next) => {
				const chkHeaders = Object.keys(req.headers).some ( k => {
					const value = headers[k.toLocaleLowerCase()]
					return (req.headers[k] as string).toLowerCase().indexOf(value) != -1
				})
				next(!chkHeaders?"router":undefined)
			})
		}

		// ciclo tutti i routers a disposizione e li inserisco nell'oggetto Router
		routers.forEach((r: IRouteParam) => {
			let method:IRouteMethod = (typeof r.method === "string")? this[r.method] : r.method
			if ( !method ) { log(`impossibile creare il nodo`, LOG_OPTION.ERROR, r);  return; }

			const verb = (r.verb ?? "get").toLocaleLowerCase()
			router[verb](r.path ?? "/", method.bind(this))
		})
		
		return router
	}

}

export interface IRouteParam {
	path?: string,
	verb?: Verb,
	method: string|IRouteMethod,
}
type IRouteMethod = (req:Request,res:Response,next:any)=>any
type Verb = "get" | "post" | "update" | "delete"