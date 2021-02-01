/**
 * @jest-environment node
 */

import axios from "axios"
import { ConfActions } from "../../../core/node/NodeConf"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { HttpRouterRestServiceBase } from "../rest/HttpRouterRestServiceBase"

const users = [
	{ id: "1", name: "Ivano" },
	{ id: "2", name: "Mattia" },
	{ id: "3", name: "Giovanna" },
]

class TestRoute extends HttpRouterRestServiceBase {

	protected async getAll(): Promise<any[]> {
		return users
	}

	protected async getById(id:string): Promise<any> {
		return users.find(u => u.id == id)
	}

	protected async save(entity:any): Promise<any> {
		if ( entity.id ) {
			const index = users.findIndex(u=>u.id==entity.id)
			users.splice(index, 1, entity )
		} else {
			entity.id = (Math.round(Math.random()*1000)+1).toString()
			users.push(entity)
		}
		return entity
	}

	protected async delete(id:string): Promise<void> {
		const index = users.findIndex(u=>u.id==id)
		if ( index!=-1 ) users.splice(index,1)
	}
}

let root = null

beforeEach(async()=>{
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
							path: "/user",
						}
					]
				}
			]
		}
	})
})

afterEach(async ()=> {
	await root.dispatch({ type: ConfActions.STOP })
})

test("su creazione", async () => {
	const test = new PathFinder(root).getNode<TestRoute>("/http/test")
	expect(test instanceof TestRoute).toBeTruthy()
	axios.defaults.adapter = require('axios/lib/adapters/http')

	let res = await axios.get("http://localhost:5001/user")
	expect(res.data).toEqual(users)

	res = await axios.get("http://localhost:5001/user/2")
	expect(res.data).toEqual(users.find(u=>u.id=="2"))

	res = await axios.post("http://localhost:5001/user", { name: "Raffaella" })
	expect(res.data).toEqual(users[users.length-1])

	res = await axios.post("http://localhost:5001/user", { name: "Giovanni", id: "3" })
	expect(users.find(u=>u.id=="3").name).toEqual("Giovanni")

	res = await axios.delete("http://localhost:5001/user/3")
	expect(users.findIndex(u=>u.id=="3")).toEqual(-1)
})