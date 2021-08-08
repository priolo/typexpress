
import express, { Request, Response, Router } from "express";
import { log, LOG_TYPE } from "@priolo/jon-utils"
import { HttpRouterServiceBase } from "./HttpRouterServiceBase";


/**
 * Mappa una richiesta http 
 * con le funzioni della classe
 */
export class HttpRouterService extends HttpRouterServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "route",
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
		const router = super.onBuildRouter()
		const { routers, headers, cors:corsOptions } = this.state

		

		// ciclo tutti i routers a disposizione e li inserisco nell'oggetto Router
		routers.forEach((route: IRouteParam) => {
			let method:IRouteMethod = (typeof route.method === "string")? this[route.method] : route.method
			if ( !method ) { log(`impossibile creare il nodo`, LOG_TYPE.ERROR, route);  return; }

			const verb = (route.verb ?? "get").toLocaleLowerCase()
			router[verb](route.path ?? "/", method.bind(this))
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