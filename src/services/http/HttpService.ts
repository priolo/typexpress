
import express, { Router, Express, Request, Response } from "express"
import fs from "fs"
import http, { Server } from "http"
import https from "https"
import cookieParser from 'cookie-parser'
import { log, LOG_TYPE } from "@priolo/jon-utils"

import { ServiceBase } from "../../core/service/ServiceBase"
import { IHttpRouter, Errors } from "./utils"
import ErrorService from "../error"


export default class HttpService extends ServiceBase implements IHttpRouter {

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

	protected override async onInit(conf:any): Promise<void> {
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

	protected override async onInitAfter() {
		super.onInitAfter()
		// il gestore degli errori va inserito per ultimo
		this.app.use( (err: Error, req: Request, res: Response, next) => {
			ErrorService.Send(this, Errors.HANDLE, err)
			next(err)
		})
	}

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

	use(router: Router, path: string = "/"): void {
		this.app.use(path, router)
	}

	private buildServer(): Server {
		const { https: httpsConf } = this.state
		let server: Server = null

		if (httpsConf) {
			server = https
				.createServer(
					{
						key: fs.readFileSync(httpsConf.privkey), // 'privkey.pem'
						cert: fs.readFileSync(httpsConf.privkey) // 'pubcert.pem'
					},
					this.app
				);
		} else {
			server = http
				.createServer(this.app);
		}

		return server
	}


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