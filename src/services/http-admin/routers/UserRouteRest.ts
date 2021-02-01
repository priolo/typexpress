import { Request, Response } from "express";
import { HttpRouterRestRepoService } from "../../http-router/rest/HttpRouterRestRepoService";


export class UserRouteRest extends HttpRouterRestRepoService {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			// name: "user",
			// path: "/users",
			routers: [
				{ verb: "patch", 	path: "/password", 	method: "changePassword" },
				{ verb: "get", 		path: "/me", 		method: "me" },
				{ verb: "post", 	path: "/refresh", 	method: "refresh" },
			]
		}
	}

	changePassword(req: Request, res: Response) {
		// if (req.cookies.token == null) return res.sendStatus(401)
		// const { old_password, new_password } = req.body

		// new Bus(this, "/typeorm/user").dispatch({ 
		// 	type: TypeormActions.FIND, 
		// 	payload: { userId: "", newPassword: new_password }
		// })

		// res.sendStatus(200)
	}

	me(req: Request, res: Response) {
		res.json(req["user"])
	}

	refresh(req: Request, res: Response) {
		const { token } = req.cookies
		res.json({ "access_token": token })
	}

}