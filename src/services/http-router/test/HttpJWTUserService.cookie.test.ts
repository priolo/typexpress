/**
 * @jest-environment node
 */
import axios from "axios"
import fs from "fs"

import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder"
import { Bus } from "../../../core/path/Bus"
import { RepoStructActions, RepoRestActions } from "../../../core/repo/utils"

import * as jwtNs from "../jwt"



const PORT = 5001
const dbPath = `${__dirname}/database.sqlite`
let root = null
axios.defaults.adapter = require('axios/lib/adapters/http')
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });


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
							// login con ID (è solo un esempio)
							path: "/login/:id", method: async function (req, res, next) {
								const userId = req.params.id

								// get user or any payload
								const user = await new Bus(this, "/typeorm/user").dispatch({
									type: RepoRestActions.GET_BY_ID,
									payload: userId,
								})

								// get service and put payload
								const jwtService = new PathFinder(root).getNode<jwtNs.Service>("/http/route-jwt")
								await jwtService.putPayload(user, res)

								// other method witout get service
								/*
								// create token
								const token = await new Bus(this, "/http/route-jwt").dispatch({
									type: RouteJWTUserActions.GENERATE_TOKEN,
									payload: user,
								})

								// metto il token nei cookie
								
								*/

								//res.cookie('token', token, { maxAge: 900000, httpOnly: true })

								res.sendStatus(200)
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
								{
									method: (req, res, next) => {
										res.json(req.jwtPayload)
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
			},
			children: [
				{
					name: "user",
					class: "typeorm/repo",
					model: {
						name: "user",
						columns: {
							id: { type: Number, primary: true, generated: false },
							username: { type: String }
						}
					},
					seeds: [
						{ id: 1, username: "Ivano" },
						{ id: 2, username: "Marina" },
						{ id: 3, username: "Mattia" },
					]
				}
			],
		},
		{
			class: "jwt",
			secret: "secret_word!!!"
		},
	])

	await new Bus(root, "/typeorm/user").dispatch({ type: RepoStructActions.SEED })
})

afterAll(async () => {
	await RootService.Stop(root)
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("creation", async () => {
	const rjwt = new PathFinder(root).getNode<jwtNs.Service>("/http/route-jwt")
	expect(rjwt).toBeInstanceOf(jwtNs.Service)
})

test("if I log in WITHOUT the token ... it should give me an error", async () => {
	let err = null
	try {
		await axiosIstance.get(`/user`)
	} catch (e) {
		err = e
	}
	expect(err.response.status).toBe(401)
})

test("if I log in with the token in the cookies it doesn't give me an error", async () => {
	// login
	const resp = await axiosIstance.get(`/user/login/2`)
	const [cookie] = resp.headers["set-cookie"]
	// get auth data
	const { data } = await axiosIstance.get(`/user`, { headers: { Cookie: cookie } })
	expect(data).toMatchObject({ id: 2, username: "Marina" })
})