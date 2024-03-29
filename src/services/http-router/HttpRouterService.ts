
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
			handleErrors: true,
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
		const { routers, handleErrors } = this.state

		// ciclo tutti i routers a disposizione e li inserisco nell'oggetto Router
		routers.forEach((route: IRouteParam) => {

			// prelevo il metodo da chiamare sulle request
			let method: IRouteMethod = (typeof route.method === "string") ? this[route.method] : route.method
			if (!method) { log(`impossibile creare il nodo`, LOG_TYPE.ERROR, route.path); return; }
			// prelevo il "verb"
			const verb = (route.verb ?? "get").toLocaleLowerCase()

			// creo il method
			const _method = method.bind(this)
			let methodThis = null
			if (handleErrors) {
				methodThis = async (req: Request, res: Response, next: any) => {
					try {
						await _method(req, res, next)
					} catch (e) {
						next(e)
					}
				}
			} else {
				methodThis = _method
			}

			// inserisco il router
			router[verb](route.path ?? "/", methodThis)
		})

		return router
	}

}

export interface IRouteParam {
	path?: string,
	verb?: Verb,
	method: string | IRouteMethod,
}
type IRouteMethod = (req: Request, res: Response, next: any) => any
type Verb = "get" | "post" | "update" | "delete"