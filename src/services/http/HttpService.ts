
import { LOG_TYPE, log } from "@priolo/jon-utils"
import cookieParser from 'cookie-parser'
import express, { Express, Request, Response, Router } from "express"
import { engine as exphbs } from 'express-handlebars'
import fs from "fs"
import http, { Server } from "http"
import https, { ServerOptions } from "https"
import { ServiceBase } from "../../core/service/ServiceBase.js"
import { HttpRouterServiceConf } from "../http-router/HttpRouterService.js"
import { SocketServerConf } from "../ws/SocketServerService.js"
import { IHttpRouter } from "./utils.js"



export type HttpServiceConf = Partial<HttpService['stateDefault']>
	& { class: "http", children?: Array<HttpRouterServiceConf | SocketServerConf> }
//export type HttpServiceAct = HttpService['dispatchMap']

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

	get stateDefault() {
		return {
			...super.stateDefault,
			/** nome del NODE di default */
			name: "http",
			/**  la porta su cui il server rimane in scolto */
			port: 5000,
			/** il render da utilizzare per il momento c'e' solo "handlebars"  */
			render: <any>null,
			/** 
			 * opzioni di express:  
			 * @link https://expressjs.com/en/4x/api.html#app.set
			 */
			options: <{ [key: string]: any }>null,
			/** 
			 * se valorizzato creo un server `https`
				@example
				https: {
					// file del certificato pubblico
					privkey: "privkey.pem",
					// file della chiave privata
					pubcert: "pubcert.pem",
				}
				@link https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener
			*/
			https: <ServerOptionsCustom>null,
		}
	}

	/**
	 * Creo l'instanza del server EXPRESS collegandola ai plugin
	 */
	protected async onInit(): Promise<void> {
		super.onInit()

		this.app = express()
		this.buildProperties()
		this.app.use(express.json())	// middleware per contenuti json
		this.app.use(express.urlencoded({ extended: true }))
		this.app.use(cookieParser())
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
			// se c'e' un gestore di errore come figlio inoltra l'errore pure li
			this.log(`HttpService:error`, err, LOG_TYPE.ERROR)
			// continua il discorso...
			next(err)
		})
	}

	/**
	 * Sulla distruzione del nodo fermo il server
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
	 */
	use(router: Router, path: string = "/"): void {
		this.app.use(path, router)
	}

	/**
	 * Costruisce il server EXPRESS
	 */
	private buildServer(): Server {
		const { https: httpsConf } = this.state as HttpServiceConf
		let server: Server = null
		// è un https
		if (httpsConf) {
			if (httpsConf.privkey) {
				httpsConf.key = fs.readFileSync(httpsConf.privkey)
				delete httpsConf.privkey
			}
			if (httpsConf.pubcert) {
				httpsConf.cert = fs.readFileSync(httpsConf.pubcert)
				delete httpsConf.pubcert
			}
			server = https.createServer(httpsConf, this.app)
			// è un http sempliciotto
		} else {
			server = http
				.createServer(this.app)
		}

		return server
	}

	/**
	 * Mette in ascolto il server EXPRESS
	 */
	private async listenServer(): Promise<http.Server> {
		return new Promise<http.Server>((res, rej) => {
			const listener = this._server.listen(
				this.state.port,
				() => {
					log(`HttpService:start:url:[http://localhost:${this.state.port}]`, LOG_TYPE.INFO)
					res(listener)
				}
			)
		})
	}

	/**
	 * Setta l'engine handlebars
	 */
	private buildRender(): void {
		if (!this.state.render) return

		// https://github.com/express-handlebars/express-handlebars#api
		const options = this.state.render.options ?? { extname: ".hbs" }
		const engine = exphbs(options)

		this.app.engine(options.extname, engine)
		this.app.set('view engine', options.extname);
	}

	/**
	 * https://expressjs.com/en/4x/api.html#app.set
	 */
	private buildProperties(): void {
		if (!this.state.options) return
		Object.entries(this.state.options).forEach(([key, value]) => this.app.set(key, value))
	}
}

type ServerOptionsCustom = ServerOptions & { privkey: string, pubcert: string }