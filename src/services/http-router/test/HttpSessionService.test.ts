/**
 * @jest-environment node
 */
import path from "path"
import axios, { AxiosInstance } from "axios"

import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { HttpSessionService } from "../session/HttpSessionService"

import * as typeormNs  from "../../typeorm";
import { SessionEntity } from "../session/SessionEntity"
import { getFreePort } from "../../ws"



axios.defaults.adapter = require('axios/lib/adapters/http')
let PORT
let axiosIstance: AxiosInstance
const dbPath = path.join(__dirname, "/database.sqlite")
let root = null

beforeAll(async () => {
	PORT = await getFreePort()
	axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });

	root = await RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					name: "mem-session",
					class: "http-router/session",
					path: "/mem",
					children: [
						{
							class: "http-router",
							path: "/",
							routers: [
								{
									path: "/write", verb: "post",
									method: (req, res, next) => {
										req.session.value = req.body.value
										res.json({ res: "ok" })
									}
								},
								{
									path: "/read", verb: "get",
									method: (req, res, next) => {
										res.json({ value: req.session.value })
									}
								},
							]
						}
					]
				},
				{
					name: "typeorm-session",
					class: "http-router/session",
					typeorm: "/typeorm",
					path: "/type",
					children: [
						{
							class: "http-router",
							path: "/",
							routers: [
								{
									path: "/write", verb: "post",
									method: (req, res, next) => {
										req.session.value = req.body.value
										res.json({ res: "ok" })
									}
								},
								{
									path: "/read", verb: "get",
									method: (req, res, next) => {
										res.json({ value: req.session.value })
									}
								},
							]
						}
					]
				},
			]
		},
		{
			class: "typeorm",
			options: {
				"type": "sqlite",
				"database": dbPath,
				"synchronize": true,
				"entities": [SessionEntity],
			},
		}
	])
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("creazione", async () => {
	const sesMem = new PathFinder(root).getNode<HttpSessionService>("/http/mem-session")
	expect(sesMem).toBeInstanceOf(HttpSessionService)

	const sesType = new PathFinder(root).getNode<HttpSessionService>("/http/typeorm-session")
	expect(sesType).toBeInstanceOf(HttpSessionService)

	const typeorm = new PathFinder(root).getNode<typeormNs.Service>("/typeorm")
	expect(typeorm).toBeInstanceOf(typeormNs.Service)
})

test("write and read in mem", async () => {
	let res = await axiosIstance.post<any>("/mem/write", { value: "pippo" })
	res = await axiosIstance.get(
		"/mem/read",
		{
			headers: {
				Cookie: res.headers["set-cookie"][0]
			}
		}
	)
	expect(res.data.value).toBe("pippo")
})

test("write and read in typeorm", async () => {
	let res = await axiosIstance.post<any>("/type/write", { value: "pippo" })
	res = await axiosIstance.get(
		"/type/read",
		{
			headers: {
				Cookie: res.headers["set-cookie"][0]
			}
		}
	)
	expect(res.data.value).toBe("pippo")
})