/**
 * @jest-environment node
 */
import axios, { AxiosInstance } from "axios"
import { ErrorNotify } from "./ErrorNotify"
import { RootService } from "../../core/RootService"
import { getFreePort } from "../ws"


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
				//console.error(error)
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
							path: "/throw1", verb: "get", method: (req, res, next) => {
								next(new ErrorNotify("test:error1"))
							}
						},
						{
							path: "/throw2", verb: "get", method: (req, res, next) => {
								next(new ErrorNotify("test:error2"))
								//throw new Error("test:error2")
							}
						},
						{
							path: "/throw3", verb: "get", method: (req, res, next) => {
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

test("gestione errori", async () => {
	let error

	try {
		await axiosIstance.get<any>(`/test/throw1`)
	} catch (err) {
		error = err
	}
	expect(error.response.status).toBe(500)

	try {
		await axiosIstance.get<any>(`/test/throw2`)
	} catch (err) {
		error = err
	}
	expect(error.response.status).toBe(500)

	try {
		await axiosIstance.get<any>(`/test/throw3`)
	} catch (err) {
		error = err
	}
	expect(error.response.status).toBe(500)

	console.log(results)
})
