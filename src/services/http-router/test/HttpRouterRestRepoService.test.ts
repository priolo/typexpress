import axios from "axios"
import fs from "fs"

import { RootService } from "../../../core/RootService"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PathFinder } from "../../../core/path/PathFinder"

import { HttpRouterRestRepoService } from "../rest/HttpRouterRestRepoService";



axios.defaults.adapter = require('axios/lib/adapters/http')
const PORT = 5002
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
const dbPath = `${__dirname}/database.sqlite`
let root, user1, user2, users

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	age: number;
}




beforeAll(async () => {
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }

	root = await RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					name: "user",
					path: "/user",
					class: "http-router/repo",
					repository: "/typeorm/user",
				}
			]
		},
		{
			class: "typeorm",
			options: {
				"type": "sqlite",
				"database": dbPath,
				"synchronize": true,
				"entities": [User],
			},
			children: [
				{ name: "user", class: "typeorm/repo", model: "User" },
			]
		}
	])
})

afterAll(async () => {
	await RootService.Stop(root)
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("su creazione", async () => {
	const rr = new PathFinder(root).getNode<HttpRouterRestRepoService>("/http/user")
	expect(rr).toBeInstanceOf(HttpRouterRestRepoService)
})

test("post: nuovo USER 1", async () => {
	const { data } = await axiosIstance.post(`/user`,
		{ firstName: "Raffaella", lastName: "Iorio", age: 44 }
	)
	user1 = data
	expect(user1).toEqual(
		{ id: 1, firstName: "Raffaella", lastName: "Iorio", age: 44 }
	)
})

test("post: nuovo USER 2", async () => {
	const { data } = await axiosIstance.post(`/user`,
		{ firstName: "Ivano", lastName: "Iorio", age: 45 }
	)
	user2 = data
	expect(user2).toEqual(
		{ id: 2, firstName: "Ivano", lastName: "Iorio", age: 45 }
	)
})

test("index: prelevo tutti gli USER", async () => {
	const { data } = await axiosIstance.get(`/user`)
	users = data
	expect(users).toEqual([user1, user2])
})

test("get: prelevo USER 2", async () => {
	const { data: user2_copy } = await axiosIstance.get("/user/2")
	expect(user2_copy).toEqual(user2)
})

test("post: modifico USER 2", async () => {
	let { data: user2_modify } = await axiosIstance.post(
		"/user",
		{ id: 2, firstName: "Giovanni" }
	)
	user2_modify = { ...user2, ...user2_modify }
	expect(user2_modify.firstName).not.toEqual(user2.firstName)
	const { data: user2_current } = await axiosIstance.get("/user/2")
	expect(user2_current).toEqual(user2_modify)
	expect(user2_current).not.toEqual(user2)
})

test("delete: cancello USER 2", async () => {
	await axiosIstance.delete("/user/2")
	const { data: user2_del } = await axiosIstance.get("/user/2")
	expect(user2_del).toBeNull()
})