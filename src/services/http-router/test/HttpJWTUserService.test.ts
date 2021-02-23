/**
 * @jest-environment node
 */

import axios from "axios"
import fs from "fs"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/RepoRestActions";
import { HttpJWTUserService } from "../jwt/HttpJWTUserService";
import { Bus } from "../../../core/path/Bus";
import { JWTActions } from "../../jwt/JWTRepoService";



const dbPath = `${__dirname}/database.sqlite`
let root = null
let user1, user2, token


beforeAll(async () => {

	if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)

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
							class: "http-router",
							path: "/user",
							routers: [
								{ path: "/login/:id", method: async function (req, res, next) {
									res.json({
										token: await new Bus(this,"/jwt").dispatch({
											type: JWTActions.ENCODE,
											payload: req.params.id,
										})
									})
								}}
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
					typeorm: {
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
			]
		}
	})
})

afterAll(async () => {
	await root?.dispatch({ type: ConfActions.STOP })
	//if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
})

test("creazione", async () => {
	axios.defaults.adapter = require('axios/lib/adapters/http')
	const rjwt = new PathFinder(root).getNode<HttpJWTUserService>("/http/route-jwt")
	expect(rjwt).toBeInstanceOf(HttpJWTUserService)
})

test("crea due USER", async () => {
	user1 = await new Bus(root,"/typeorm/user").dispatch({ type: RepoRestActions.SAVE, payload: { username: "priolo" } })
	user2 = await new Bus(root,"/typeorm/user").dispatch({ type: RepoRestActions.SAVE, payload: { username: "zago" } })
	expect(user1).toBeDefined()
	expect(user2).toBeDefined()
})

test("se accedo SENZA il token ... mi dovrebbe dare errore", async () => {
	let err = null
	try {
		await axios.get( `http://localhost:5001/user`)
	} catch ( e ) {
		err = e
	}
	expect(err.response.status).toBe(401)
})

test("simulo il login e ricavo il token", async () => {
	const { data } = await axios.get(`http://localhost:5001/user/login/${user2.id}`)
	token = data.token
	expect(typeof token).toBe("string")
})

test("se accedo con il token nei cookies non mi da errore", async () => {
	const {data:reuser2} = await axios.get(
		`http://localhost:5001/user`, 
		{ headers: { Cookie: `token=${token};` } }
	)
	expect(reuser2).toEqual(user2)
})