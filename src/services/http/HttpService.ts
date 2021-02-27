
import express, { Router, Express } from "express"
import fs from "fs"
import { ServiceBase } from "../../core/ServiceBase"
import http, { Server } from "http"
import https from "https"
import { log, LOG_OPTION } from "../../utils/log"
import { IHttpRouter } from "./IHttpRouter"
import cookieParser from 'cookie-parser'
import session from 'express-session'
import cors from "cors"

export class HttpService extends ServiceBase implements IHttpRouter {

	private app: Express | null = null

	private server: Server | null = null

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
			//template: "handlebars"
		}
	}

	protected async onInit(): Promise<void> {
		const { template } = this.state

		this.app = express()
		this.app.use(express.json())	// middleware per contenuti json
		this.app.use(express.urlencoded({ extended: true }))
		this.app.use(cookieParser())
		// this.app.use(
		// 	session({
		// 		secret: "a secret string",
		// 		resave: true,
		// 		saveUninitialized: false,
		// 		cookie: { maxAge: 60000 }
		// 	})
		// );
		//this.app.use(cors())

		//[II] da sistemare la gestione del render
		if (template == "handlebars") {
			var exphbs = require('express-handlebars');
			this.app.engine('.hbs', exphbs({
				//layoutsDir: __dirname + '/views/layouts',
				extname: '.hbs',
				//defaultLayout: "layout"
			}));
			this.app.set('view engine', '.hbs');
		}

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

	private async listenServer(): Promise<void> {
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