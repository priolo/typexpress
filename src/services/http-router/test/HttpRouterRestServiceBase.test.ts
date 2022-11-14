/**
 * @jest-environment node
 */
import axios, { AxiosInstance } from "axios"
import { getFreePort } from "../../ws"

import { PathFinder, RootService } from "../../../index"
import { HttpRouterRestServiceBase } from "../rest/HttpRouterRestServiceBase"



axios.defaults.adapter = require('axios/lib/adapters/http')
let PORT
let axiosIstance: AxiosInstance
let root = null

const users = [
	{ id: "1", name: "Ivano" },
	{ id: "2", name: "Mattia" },
	{ id: "3", name: "Giovanna" },
]


class TestRoute extends HttpRouterRestServiceBase {

	protected async getAll(): Promise<any[]> {
		return users
	}

	protected async getById(id: string): Promise<any> {
		return users.find(u => u.id == id)
	}

	protected async save(entity: any): Promise<any> {
		if (entity.id) {
			const index = users.findIndex(u => u.id == entity.id)
			users.splice(index, 1, entity)
		} else {
			entity.id = (Math.round(Math.random() * 1000) + 1).toString()
			users.push(entity)
		}
		return entity
	}

	protected async delete(id: string): Promise<void> {
		const index = users.findIndex(u => u.id == id)
		if (index != -1) users.splice(index, 1)
	}
}

beforeAll(async () => {
	PORT = await getFreePort()
	axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
	root = RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					name: "test",
					class: TestRoute,
					path: "/user",
				}
			]
		}
	])
})

afterAll(async () => {
	await RootService.Stop(root)
})

test("su creazione", async () => {

	
	const test = new PathFinder(root).getNode<TestRoute>("/http/test")
	expect(test instanceof TestRoute).toBeTruthy()

	let res = await axiosIstance.get(`/user`)
	expect(res.data).toEqual(users)

	res = await axiosIstance.get(`/user/2`)
	expect(res.data).toEqual(users.find(u => u.id == "2"))

	res = await axiosIstance.post(`/user`, { name: "Raffaella" })
	expect(res.data).toEqual(users[users.length - 1])

	res = await axiosIstance.post(`/user`, { name: "Giovanni", id: "3" })
	expect(users.find(u => u.id == "3").name).toEqual("Giovanni")

	res = await axiosIstance.delete(`/user/3`)
	expect(users.findIndex(u => u.id == "3")).toEqual(-1)
})