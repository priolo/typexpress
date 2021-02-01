/* eslint eqeqeq: "off" */
import { rest } from 'msw'
import { auth as users } from "../../data/users"


const exp = [

	// login
	rest.post('/api/auth/login', (req, res, ctx) => {
		const { username, password } = req.body;
		if (!username || !password) return res(ctx.status(500))
		const user = users.find(u => u.username == username && u.password == password);
		if (user == null) return res(
			ctx.status(400),
			ctx.json({ "errors": [{ "code": "password_match", "field": "password" }] })
		)
		return res(
			ctx.delay(500),
			ctx.status(200),
			ctx.json({ "access_token": user.token }),
		)
	}),

	// get current user
	rest.get('/api/auth/me', (req, res, ctx) => {
		const { token } = req.cookies
		const user = users.find(u => u.token == token);
		if (user == null) return res(ctx.status(401))
		const userData = { ...user, password: undefined, token: undefined }
		return res(
			ctx.delay(200),
			ctx.status(200),
			ctx.json(userData),
		)
	}),

	// refresh token
	rest.get('/api/auth/refresh', (req, res, ctx) => {
		const { token } = req.cookies
		return res(
			ctx.status(200),
			ctx.json({ "access_token": token }),
		)
	}),

	rest.get('/api/error/:code', (req, res, ctx) => {
		const code = req.params.code
		return res(
			ctx.status(code),
		)
	})

]

export default exp