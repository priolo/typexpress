
import { LOG_TYPE, log } from "@priolo/jon-utils";
import { Request, Response, Router } from "express";
import { HttpRouterServiceBase, HttpRouterServiceBaseConf } from "./HttpRouterServiceBase";



// export interface HttpRouterServiceConf extends HttpRouterServiceBaseConf {
// 	/** 
// 	 * @example
// 	{ path: "/hi", verb: "get", method: (req, res, next) => "HELLO WORLD" },
// 	{ path: "/test", verb: "post", method: "myFunction" },
// 	*/
// 	routers: IRouteParam[]
// 	/** wrap try--catch intorno al metodo */
// 	handleErrors?: boolean
// }

export type HttpRouterServiceConf = Partial<HttpRouterService['stateDefault']> & { class: "http-router", children?: HttpRouterServiceConf[] }

/**
 * Mappa una richiesta http con le funzioni della classe
 */
export class HttpRouterService extends HttpRouterServiceBase {

	get stateDefault() {
		return {
			...super.stateDefault,
			name: "route",
			handleErrors: true,
			routers: <IRouteParam[]>[]
		}
	}


	protected onBuildRouter(): Router {
		const router = super.onBuildRouter()

		// ciclo tutti i routers a disposizione e li inserisco nell'oggetto Router
		this.state.routers.forEach((route: IRouteParam) => {

			// prelevo il metodo da chiamare sulle request
			let method: IRouteMethod = (typeof route.method === "string") ? this[route.method] : route.method
			if (!method) { log(`impossibile creare il nodo`, LOG_TYPE.ERROR, route.path); return; }
			// prelevo il "verb"
			const verb = (route.verb ?? "get").toLocaleLowerCase()

			// creo il method
			const _method = method.bind(this)
			let methodThis = null
			if (this.state.handleErrors) {
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
	verb?: string, //"get" | "post" | "update" | "delete",
	method: string | IRouteMethod,
}
type IRouteMethod = (req: Request, res: Response, next: any) => any
//type Verb = "get" | "post" | "update" | "delete"