
import express, { Router, Express } from "express"
import fs from "fs"
import { ServiceBase } from "../../core/ServiceBase"
import http, { Server } from "http"
import https from "https"
import { log, LOG_OPTION } from "../../utils/log"
import { IHttpRouter } from "./IHttpRouter"
import cookieParser from 'cookie-parser'


export class HttpService extends ServiceBase implements IHttpRouter {

	private app: Express | null = null

	private server: Server | null = null

	get defaultConfig():any { return { ...super.defaultConfig,
		name: "http",
		port: 5000,					// porta di ascolto del server
		//// se valorizzato creo un server https
		// https: {
		// 	privkey: "privkey.pem", // file path
		// 	pubcert: "pubcert.pem",	// file path
		// }
	}}

	protected async onInit(): Promise<void> {
		this.app = express()
		this.app.use(express.json())	// middleware per contenuti json
		this.app.use(express.urlencoded({ extended: true }))
		this.app.use(cookieParser())

		this.server = this.buildServer()
		await this.listenServer()
	}

	protected async onDestroy(): Promise<void> {
		return new Promise<void>((res, rej) => {
			this.server.close((err) => {
				log(`HttpService:stop`, LOG_OPTION.DEBUG)
				this.server = null
				res()
			})
			setImmediate(() => {
				this.server?.emit('close')
				//res()
			})
		})
	}

	use(router: Router, path:string="/"): void {
		this.app.use(path, router)
	}

	private buildServer(): Server {
		const { https: httpsConf } = this.state
		let server:Server = null

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

	private async listenServer(): Promise<void>{
		const { port } = this.state
		return new Promise<void>((res, rej) => {
			this.server.listen(
				port,
				() => {
					log(`HttpService:start:url:[http://localhost:${port}]`, LOG_OPTION.DEBUG)
					res()
				}
			)
		})
	}
}