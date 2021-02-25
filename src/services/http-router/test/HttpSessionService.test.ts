/**
 * @jest-environment node
 */

import axios from "axios"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { ConfActions } from "../../../core/node/NodeConf";
import { HttpSessionService } from "../session/HttpSessionService";


let root = null
axios.defaults.adapter = require('axios/lib/adapters/http')
const axiosIstance = axios.create({ baseURL: "http://localhost:5001", withCredentials: true });

beforeAll(async () => {
	root = await RootService.Start({
		class: "http",
		port: 5001,
		children: [
			{
				name: "simple-session",
				class: "http-router/session",
				path: "/simple",
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
			// {
			// 	name: "typeorm-session",
			// 	class: "http-router/session",
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
		]
	})
})
afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
})
test("creazione", async () => {
	const ses = new PathFinder(root).getNode<HttpSessionService>("/http/simple-session")
	expect(ses).toBeInstanceOf(HttpSessionService)
})

test("test scrittura e lettura", async () => {

	await new Promise( r=>setTimeout(r,2000))

	let res = await axiosIstance.post("/simple/write", { value: "pippo" })
	res = await axiosIstance.get(
		"/simple/read",
		{
			headers: {
				Cookie: res.headers["set-cookie"][0]
			}
		}
	)
	expect(res.data.value).toBe("pippo")
})
