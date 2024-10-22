import axios, { AxiosInstance } from "axios"
import httpAdapter from 'axios/lib/adapters/http'
import { error as errorNs, RootService } from "../../index.js"
import { getFreePort } from "../ws/index.js"



axios.defaults.adapter = httpAdapter
let PORT:number
let axiosIstance: AxiosInstance
let root:RootService
const results:any[] = []

beforeEach(async () => {
	PORT = await getFreePort()
	axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });

	root = await RootService.Start([
		{
			class: "error",
			onError: ({ message, code, level }, sender) => {
				results.push({
					message, code, level,
					sender
				})
			}
		},
		{
			class: "http",
			port: PORT,
			children: [
				{
					class: "http-router",
					path: "/test",
					routers: [
						{
							path: "/throw_error", verb: "get", method: (req, res, next) => {
								throw "test:error3"
							}
						}
					]
				},
			]
		}
	])
})

afterAll(async () => {
	await RootService.Stop(root)
})

/**
ErrorService è instanziate SEMPRE in automatico sull'avvio del RootNode
Si trova nella path "/error"
Eventualmente si puo' sovrascrivere (in questo caso non verra' instanziato)
Tutti gli errori gestiti in Typexpress vengono notificati a questo service

> NOTA: in futuro si vuole gestire gli error in maniera differente
> cioe' notificando l'errore al piu' vicino ErrorService rispetto a dove è stato generato
 */
test("gestione errori", async () => {

	// lancio due errori direttamente nel ErrorService
	let error
	errorNs.Service.Send(root, "description of error", "code:2", errorNs.ErrorLevel.ALARM)
	errorNs.Service.Send(root, "code:2")

	// lancio un errore chiamando il routing
	try {
		await axiosIstance.get<any>(`/test/throw_error`)
	} catch (err) {
		error = err
	}
	expect(error.response.status).toBe(500)

	// gli errori intercettati in "onError" dovrebbero essere i seguenti:
	expect(results).toEqual([
		{
			message: "description of error",
			code: "code:2",
			level: "alarm",
			sender: "/",
		},
		{
			message: "code:2",
			code: "code:2",
			level: "error",
			sender: "/",
		},
		{
			message: "test:error3",
			code: "http:handle",
			level: "error",
			sender: "/http",
		},
	])
})
