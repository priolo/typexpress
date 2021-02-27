/**
 * @jest-environment node
 */
import path from "path"
import axios from "axios"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { ConfActions } from "../../../core/node/NodeConf";
import { HttpSessionService } from "../session/HttpSessionService";
import TypeormService from "../../typeorm";


let root = null
const dbPath = path.join(__dirname, "/database.sqlite")
axios.defaults.adapter = require('axios/lib/adapters/http')
const axiosIstance = axios.create({ baseURL: "http://localhost:5001", withCredentials: true });


beforeAll(async () => {
	root = await RootService.Start({
		class: "http",
		port: 5001,
		children: [
			// {
			// 	name: "simple-session",
			// 	class: "http-router/session",
			// 	path: "/simple",
			// 	children: [
			// 		{
			// 			class: "http-router",
			// 			path: "/",
			// 			routers: [
			// 				{
			// 					path: "/write", verb: "post",
			// 					method: (req, res, next) => {
			// 						req.session.value = req.body.value
			// 						res.json({ res: "ok" })
			// 					}
			// 				},
			// 				{
			// 					path: "/read", verb: "get",
			// 					method: (req, res, next) => {
			// 						res.json({ value: req.session.value })
			// 					}
			// 				},
			// 			]
			// 		}
			// 	]
			// },
			{
				name: "typeorm-session",
				class: "http-router/session",
				typeorm: "/http/typeorm",
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
				class: "typeorm",
				typeorm: {
					"type": "sqlite",
					"database": dbPath,
					"synchronize": true
				},
				schemas: [
					{
						name: "Session",
						columns: {
							id: { type: Number, primary: true, generated: true },
							expireAt: { type: String },
							text: { type: String },
						}
					}
				],
			}
		]
	})
	console.log(root)
	debugger
})
afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
})
test("creazione", async () => {
	// const simpleSes = new PathFinder(root).getNode<HttpSessionService>("/http/simple-session")
	// expect(simpleSes).toBeInstanceOf(HttpSessionService)
debugger
	const typeSes = new PathFinder(root).getNode<HttpSessionService>("/http/typeorm-session")
	expect(typeSes).toBeInstanceOf(HttpSessionService)

	const typeorm = new PathFinder(root).getNode<TypeormService>("/http/typeorm")
	expect(typeorm).toBeInstanceOf(TypeormService)
})

// test("test scrittura e lettura", async () => {
// 	let res = await axiosIstance.post("/simple/write", { value: "pippo" })
// 	res = await axiosIstance.get(
// 		"/simple/read",
// 		{
// 			headers: {
// 				Cookie: res.headers["set-cookie"][0]
// 			}
// 		}
// 	)
// 	expect(res.data.value).toBe("pippo")
// })

// test("test scrittura e lettura", async () => {
// 	let res = await axiosIstance.post("/simple/write", { value: "pippo" })
// 	res = await axiosIstance.get(
// 		"/simple/read",
// 		{
// 			headers: {
// 				Cookie: res.headers["set-cookie"][0]
// 			}
// 		}
// 	)
// 	expect(res.data.value).toBe("pippo")
// })