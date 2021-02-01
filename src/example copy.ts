import axios from "axios"
import { PathFinder } from "./core/path/PathFinder"
import { Request, Response } from "express"
import HttpService from "./services/http"
import { HttpRouterService, RootService } from "./index"
import { ConfActions } from "./core/node/NodeConf"


class TestRoute extends HttpRouterService {
	getUser(req: Request, res: Response) {
		res.json({ response: "ok" })
	}
}

const fn = async ()=> {
	const root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "http",
					port: 5001,
					children: [
						{
							class: TestRoute,
							path: "/admin",
							routers: [
								{ path: "/user", verb: "get", method: "getUser" }
							]
						}
					]
				}
			]
		}
	})

	console.log("START ..............................")
	const http = new PathFinder(root).getNode<HttpService>("/http")
	axios.defaults.adapter = require('axios/lib/adapters/http')
	console.log("0 STOP ..............................")
	const {data} = await axios.get("http://localhost:5001/admin/user")
	console.log(data)
	//expect(data).toEqual({ response: "ok" })
	console.log("1 STOP ..............................")
	await root.dispatch({ type: ConfActions.STOP })
	console.log("2 STOP ..............................")

}

fn()

//while(true);