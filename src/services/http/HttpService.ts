
import express, { Router, Express, Request, Response } from "express"
import fs from "fs"
import http, { Server } from "http"
import https from "https"
import cookieParser from 'cookie-parser'
import { log, LOG_TYPE } from "@priolo/jon-utils"

import { ServiceBase } from "../../core/service/ServiceBase"
import { PathFinder } from "../../core/path/PathFinder"

import { IHttpRouter, Errors } from "./utils"
import ErrorService, { Actions as ActionsError } from "../error"

/**
 * Praticamente mantiene un instanza di un server "express"
 * raccoglie il meglio del meglio di EXPRESS!!!
 */
export class HttpService extends ServiceBase implements IHttpRouter {

	//#region SERVICE

	private app: Express | null = null
	private _server: Server | null = null
	get server(): Server {
		return this._server
	}

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "http",
			port: 5000,					// porta di ascolto del server

			//// se valorizzato creo un server https
			// https: {
			// 	privkey: "privkey.pem", // file path
			// 	pubcert: "pubcert.pem",	// file path
			// }

			/// il render da utilizzare per il momento c'e' solo "handlebars"
			render: null,

			/// le opzioni di express
			// https://expressjs.com/en/4x/api.html#app.set
			options: null,
		}
	}

	/**
	 * Creo l'instanza del server EXPRESS collegandola ai plugin
	 * @param conf 
	 */
	protected async onInit(conf: any): Promise<void> {
		super.onInit(conf)
		const { template } = this.state

		this.app = express()
		this.buildProperties()
		this.app.use(express.json())	// middleware per contenuti json
		this.app.use(express.urlencoded({ extended: true }))
		this.app.use(cookieParser())
		//this.app.use(cors())
		this.buildRender()
		this._server = this.buildServer()
		await this.listenServer()
	}

	/**
	 * Alla fine di tutto metto il gestore degli errori
	 */
	protected async onInitAfter() {
		super.onInitAfter()
		// il gestore degli errori va inserito per ultimo
		this.app.use((err: Error, req: Request, res: Response, next) => {
			ErrorService.Send(this, err, Errors.HANDLE)

			// [II] CAPIRE se è utile gestire gli errori come children
			/*
			cioe' l'error da utilizzare è nei propri children oppure nei children del parent a ricorsione
			e non sempre e solo /error
			a questo punto pensare ai log nella stessa maniera
			*/

			const errorSrv = new PathFinder(this).getNode<ErrorService>("error")
			if (errorSrv) {
				errorSrv.dispatch({
					type: ActionsError.NOTIFY,
					payload: err
				})
			}
			next(err)
		})
	}

	/**
	 * Sulla distruzione del nodo fermo il server
	 * @returns 
	 */
	protected async onDestroy(): Promise<void> {
		return new Promise<void>((res, rej) => {
			this._server.close((err) => {
				log(`HttpService:stop`, LOG_TYPE.INFO)
				this._server = null
				res()
			})
			setImmediate(() => {
				this._server?.emit('close')
				//res()
			})
		})
	}

	//#endregion


	/**
	 * Questa funzione è utilizzata dai CHILD quando devono agganciarsi a questo servizio PARENT
	 * @param router 
	 * @param path 
	 */
	use(router: Router, path: string = "/"): void {
		this.app.use(path, router)
	}

	/**
	 * Costruisce il server EXPRESS
	 * @returns 
	 */
	private buildServer(): Server {
		let { https: httpsConf } = this.state
		let server: Server = null

		if (httpsConf) {
			if ( httpsConf.privkey ) {
				httpsConf.key = fs.readFileSync(httpsConf.privkey)
				delete httpsConf.privkey
			}
			if ( httpsConf.pubcert ) {
				httpsConf.cert = fs.readFileSync(httpsConf.pubcert)
				delete httpsConf.pubcert
			}
			server = https.createServer(httpsConf, this.app)
		} else {
			server = http
				.createServer(this.app)
		}

		return server
	}

	/**
	 * Mette in ascolto il server EXPRESS
	 * @returns 
	 */
	private async listenServer(): Promise<http.Server> {
		const { port } = this.state
		return new Promise<http.Server>((res, rej) => {
			const listener = this._server.listen(
				port,
				() => {
					log(`HttpService:start:url:[http://localhost:${port}]`, LOG_TYPE.INFO)
					res(listener)
				}
			)
		})
	}

	/**
	 * Setta l'engine handlebars
	 * @returns 
	 */
	private buildRender(): void {
		const { render } = this.state
		if (!render) return
		const exphbs = require('express-handlebars')

		// https://github.com/express-handlebars/express-handlebars#api
		const options = render.options ?? { extname: ".hbs" }
		const engine = exphbs(options)

		this.app.engine(options.extname, engine)
		this.app.set('view engine', options.extname);
	}

	// https://expressjs.com/en/4x/api.html#app.set
	private buildProperties(): void {
		const { options } = this.state
		if (!options) return
		Object.keys(options).forEach(key => {
			this.app.set(key, options[key]);
		})
	}
}