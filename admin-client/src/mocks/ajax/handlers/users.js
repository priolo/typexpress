/* eslint eqeqeq: "off" */
import { requestValidator } from '../utils'
import { auth as users, index as usersList } from "../../data/users"


const exp = [

	// index
	requestValidator("get", '/api/users', (req, res, ctx) => {
		return res(
			ctx.delay(500),
			ctx.status(200),
			ctx.json(usersList)
		)
	}),

	// get
	requestValidator("get", '/api/users/:id', (req, res, ctx) => {
		if (req.cookies.token == null) return res(ctx.status(401))
		return res(
			ctx.delay(500),
			ctx.status(200),
			ctx.json({
				"id": req.params.id,
				"username": "Mario",
				"role": 200,
				"has_to_change_password": false,
				"created_at": "2020-08-21T16:31:30.364146146Z",
				"updated_at": "2020-08-21T19:55:50.188570215+03:00",
			})
		)
	}),

	// create
	requestValidator("post", '/api/users', (req, res, ctx) => {
		if (req.cookies.token == null) return res(ctx.status(401))
		const { username, password, role } = req.body;
		if (username == null || password == null || role==null) return res(ctx.status(500))
		const user = users.find(u => u.username == username);
		if (user != null) return res(
			ctx.status(400),
			ctx.json({ "errors": [{ "code": "unique", "field": "username" }] })
		)

		return res(
			ctx.delay(500),
			ctx.status(200),
			ctx.json({
				"id": Math.floor(Math.random() * 100),
				"username": username,
				"role": role,
				"has_to_change_password": true,
				"created_at": "2020-08-21T16:31:30.364146146Z",
				"updated_at": "2020-08-21T19:55:50.188570215+03:00",
			})
		)
	}),

	// update
	requestValidator("patch", '/api/users/:id', (req, res, ctx) => {
		if (req.cookies.token == null) return res(ctx.status(401))
		const { username, role } = req.body;
		if (!username) return res(ctx.status(401))
		return res(
			ctx.delay(500),
			ctx.status(200),
			ctx.json({
				"id": req.params.id,
				"username": username,
				"role": role,
				"has_to_change_password": false,
				"created_at": "2020-08-21T16:31:30.364146146Z",
				"updated_at": "2020-08-21T19:55:50.188570215+03:00",
			})
		)
	}),

	// delete
	requestValidator("delete", '/api/users/:id', (req, res, ctx) => {
		if (req.cookies.token == null) return res(ctx.status(401))
		return res(
			ctx.delay(500),
			ctx.status(200),
		)
	}),

	// change password
	requestValidator("patch", '/api/users/:id/password', (req, res, ctx) => {
		if (req.cookies.token == null) return res(ctx.status(401))
		const { old_password, new_password } = req.body;
		const user = users.find(u => u.password == old_password && u.token == req.cookies.token);
		if (user == null) return res(
			ctx.status(400),
			ctx.json({ "errors": [
				  {
					"code": "old_password_match",
					"field": "old_password"
				  },
			]})
		)
		if (!old_password || !new_password || old_password == new_password) res(ctx.status(500))
		return res(
			ctx.delay(500),
			ctx.status(200),
		)
	}),

]


export default exp