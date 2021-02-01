/**
 * @jest-environment node
 */

import axios from "axios"
import { ConfActions } from "../../../core/node/NodeConf"
import { Request, Response } from "express"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { HttpRouterService } from "../HttpRouterService"


class TestRoute extends HttpRouterService {
	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			routers: [
				{ path: "/test", verb: "get", method: "test" },
			]
		}
	}
	test(req: Request, res: Response) {
		res.json({ response: "test-ok" })
	}
}

let root = null

beforeEach(async () => {
	root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "http",
					port: 5001,
					children: [
						{
							name: "test",
							class: TestRoute,
							path: "/admin",
							routers: [
								{ path: "/user", verb: "get", method: (req, res, next) => res.json({ response: "user-ok" }) }
							]
						},
						{
							name: "test4",
							class: "http-router",
							path: "/async",
							routers: [
								{ path: "/", verb: "get", method: async (req, res, next) => {
									await new Promise( (rs, rj)=>setTimeout(rs,300) )
									res.json({ response: "async" })
								}},
							],
						},
						{
							class: "http-router",
							path: "/sub",
							children: [
								{
									name: "test1",
									class: TestRoute,
									path: "/route1",
								},
								{
									name: "test2",
									class: TestRoute,
									path: "/route2",
								},
								{
									name: "test3",
									class: "http-router",
									path: "/route3",
									headers: {"accept":"json"},
									routers: [
										{ path: "/test", verb: "get", method: (req, res, next) => res.json({ response: "with_header" }) },
									]
								},
								{
									name: "test4",
									class: "http-router",
									path: "/route3",
									routers: [
										{ path: "/test", verb: "get", method: (req, res, next) => res.json({ response: "without_header" }) },
									]
								},
							]
						}
					]
				}
			]
		}
	})
})

afterEach(async () => {
	await root.dispatch({ type: ConfActions.STOP })
})


test("su creazione", async () => {
	axios.defaults.adapter = require('axios/lib/adapters/http')
	const test = new PathFinder(root).getNode<TestRoute>("/http/test")
	expect(test instanceof TestRoute).toBeTruthy()
})
test("request on route", async () => {
	const { data } = await axios.get("http://localhost:5001/admin/user")
	expect(data).toEqual({ response: "user-ok" })
})
test("request on subroute", async () => {
	const { data: d2 } = await axios.get("http://localhost:5001/sub/route2/test")
	expect(d2).toEqual({ response: "test-ok" })
})

test("request on subroute with header", async () => {
	let res = await axios.get(
		"http://localhost:5001/sub/route3/test",
	)
	expect(res.data).toEqual({ response: "with_header" })

	res = await axios.get(
		"http://localhost:5001/sub/route3/test",
		{headers: { 
			"accept":'' 
		}}
	)
	expect(res.data).toEqual({ response: "without_header" })
})

test("request async", async () => {
	const { data: d2 } = await axios.get("http://localhost:5001/async")
	expect(d2).toEqual({ response: "async" })
})
