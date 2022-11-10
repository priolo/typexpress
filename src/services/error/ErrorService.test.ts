/**
 * @jest-environment node
 */
import axios, { AxiosInstance } from "axios"
import { getFreePort } from "../ws"

import { error as errorNs, RootService } from "../../index"



axios.defaults.adapter = require('axios/lib/adapters/http')
let PORT
let axiosIstance: AxiosInstance
let root = null
const results = []


beforeEach(async () => {
	PORT = await getFreePort()
	axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });

	root = await RootService.Start([
		{
			class: "error",
			onError: (error) => {
				results.push(error)
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
cioe' notificando l'errore al piu' vicino ErrorService rispetto a dove è stato generato

 */
test("gestione errori", async () => {
	
	let error
	errorNs.Service.Send(root, "error1" )

	try {
		await axiosIstance.get<any>(`/test/throw_error`)
	} catch (err) {
		error = err
	}
	expect(error.response.status).toBe(500)


	console.log(results)
})
