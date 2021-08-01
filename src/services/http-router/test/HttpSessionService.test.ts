/**
 * @jest-environment node
 */
import path from "path"
import axios from "axios"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { ConfActions } from "../../../core/node/utils";
import { HttpSessionService } from "../session/HttpSessionService";
import TypeormService from "../../typeorm";
import { SessionEntity } from "../session/SessionEntity"



axios.defaults.adapter = require('axios/lib/adapters/http')
const PORT = 5005
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
const dbPath = path.join(__dirname, "/database.sqlite")
let root = null

beforeAll(async () => {
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
	if (root) await root.dispatch({ type: ConfActions.STOP })
})

test("creazione", async () => {
	const sesMem = new PathFinder(root).getNode<HttpSessionService>("/http/mem-session")
	expect(sesMem).toBeInstanceOf(HttpSessionService)

	const sesType = new PathFinder(root).getNode<HttpSessionService>("/http/typeorm-session")
	expect(sesType).toBeInstanceOf(HttpSessionService)

	const typeorm = new PathFinder(root).getNode<TypeormService>("/typeorm")
	expect(typeorm).toBeInstanceOf(TypeormService)
})

test("write and read in mem", async () => {
	let res = await axiosIstance.post("/mem/write", { value: "pippo" })
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
	let res = await axiosIstance.post("/type/write", { value: "pippo" })
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