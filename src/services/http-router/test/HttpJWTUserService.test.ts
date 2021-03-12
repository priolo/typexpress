/**
 * @jest-environment node
 */

import axios from "axios"
import fs from "fs"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/repo/RepoRestActions";
import { HttpJWTUserService } from "../jwt/HttpJWTUserService";
import { Bus } from "../../../core/path/Bus";
import { JWTActions } from "../../jwt/JWTRepoService";



axios.defaults.adapter = require('axios/lib/adapters/http')
const PORT = 5001
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
const dbPath = `${__dirname}/database.sqlite`
let root = null
let user1, user2, token

beforeAll(async () => {
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }

	root = await RootService.Start([
		{
			class: "http",
			port: PORT,
			children: [
				{
					class: "http-router",
					path: "/user",
					routers: [
						{
							path: "/login/:id", method: async function (req, res, next) {
								res.json({
									token: await new Bus(this, "/jwt").dispatch({
										type: JWTActions.ENCODE,
										payload: req.params.id,
									})
								})
							}
						}
					]
				},
				{
					class: "http-router/jwt",
					repository: "/typeorm/user",
					jwt: "/jwt",
					children: [
						{
							class: "http-router",
							path: "/user",
							routers: [
								{ method: (req, res, next) => res.json(req.user) },
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
			},
			schemas: [{
				name: "User",
				columns: {
					id: { type: Number, primary: true, generated: true },
					username: { type: String }
				}
			}],
			children: [
				{ name: "user", class: "typeorm/repo", model: "User" }
			]
		},
		{
			class: "jwt",
			secret: "secret_word!!!"
		},
	])
})

afterAll(async () => {
	await RootService.Stop(root)
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("creazione", async () => {
	const rjwt = new PathFinder(root).getNode<HttpJWTUserService>("/http/route-jwt")
	expect(rjwt).toBeInstanceOf(HttpJWTUserService)
})

test("crea due USER", async () => {
	user1 = await new Bus(root, "/typeorm/user").dispatch({ type: RepoRestActions.SAVE, payload: { username: "priolo" } })
	user2 = await new Bus(root, "/typeorm/user").dispatch({ type: RepoRestActions.SAVE, payload: { username: "zago" } })
	expect(user1).toBeDefined()
	expect(user2).toBeDefined()
})

test("se accedo SENZA il token ... mi dovrebbe dare errore", async () => {
	let err = null
	try {
		await axiosIstance.get(`/user`)
	} catch (e) {
		err = e
	}
	expect(err.response.status).toBe(401)
})

test("simulo il login e ricavo il token", async () => {
	const { data } = await axiosIstance.get(`/user/login/${user2.id}`)
	token = data.token
	expect(typeof token).toBe("string")
})

test("se accedo con il token nei cookies non mi da errore", async () => {
	const { data: reuser2 } = await axiosIstance.get(
		`/user`,
		{ headers: { Cookie: `token=${token};` } }
	)
	expect(reuser2).toEqual(user2)
})