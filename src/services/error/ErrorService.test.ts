/**
 * @jest-environment node
 */
import axios from "axios"

import { Request, Response } from "express"
import { ErrorNotify } from "./ErrorNotify"
import { PathFinder } from "../../core/path/PathFinder"
import { RootService } from "../../core/RootService"

axios.defaults.adapter = require('axios/lib/adapters/http')
const PORT = 5009
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
let root = null
const results = []


beforeEach(async () => {
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
