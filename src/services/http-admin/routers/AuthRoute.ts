import { Request, Response } from "express";
import { Bus } from "../../../core/path/Bus";
import { RepoRestActions } from "../../../core/RepoRestActions";

import { HttpRouterService } from "../../http-router/HttpRouterService";
import { JWTActions } from "../../jwt/JWTRepoService";
import { EmailActions, IEmail } from "../../email/EmailService";

import { User } from "../models/User";
import { TypeormActions } from "../../typeorm/TypeormRepoService";


export class AuthRoute extends HttpRouterService {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			//name: "auth",
			//path: "/auth",
			routers: [
				{ verb: "post", path: "/signin", method: "signin" },
				{ verb: "post", path: "/activate", method: "activate" },
				{ verb: "post", path: "/login", method: "login" },
			]
		}
	}

	async signin(req: Request, res: Response) {
		const { username, password } = req.body

		// controllo che non ci sia gia' lo stesso username
		let [user] = await new Bus(this, "/typeorm/user").dispatch({
			type: TypeormActions.FIND,
			payload: { where: { username } },
		})
		if (user) return res.sendStatus(409)

		// controllo che l'emeil esiste
		let emailCheck = await new Bus(this, "/email").dispatch({
			type: EmailActions.CHECK,
			payload: username,
		})
		if (!emailCheck) return res.sendStatus(400)

		// memorizzo nel db
		user = await new Bus(this, "/typeorm/user").dispatch({
			type: RepoRestActions.SAVE,
			payload: { username, password, active: false },
		})

		// creo il token
		const token = await new Bus(this, "/jwt")
			.dispatch({ type: JWTActions.ENCODE, payload: user.id })

		// mando l'email per l'attivazione
		await new Bus(this, "/email").dispatch({
			type: EmailActions.SEND,
			payload: <IEmail>{
				to: username,
				from: "noreply@admin.tree",
				subject: "registrazione",
				text: `Apri questo link per completare la registrazione: 
					http://localhost:5001/activate/${token}`,
			}
		})

		res.sendStatus(200)
	}

	async activate(req: Request, res: Response) {
		const { token } = req.body

		// ricavo l'id dell'utente
		const id = await new Bus(this, "/jwt")
			.dispatch({ type: JWTActions.DECODE, payload: token })

		// prelevo l'utente
		let user = await new Bus(this, "/typeorm/user").dispatch({
			type: RepoRestActions.GET_BY_ID,
			payload: id,
		})

		// se non c'e' nessun utente con quell'id allora c'e' un errore
		if (!user) return res.sendStatus(404)

		// attivo l'utente e lo salvo
		await new Bus(this, "/typeorm/user").dispatch({
			type: RepoRestActions.SAVE,
			payload: { id, active: true },
		})

		res.json({ response: "activate" })
	}

	async login(req: Request, res: Response) {
		const { username, password } = req.body

		// cerco l'utente
		let [user]:User[] = await new Bus(this, "/typeorm/user").dispatch({
			type: TypeormActions.FIND,
			payload: { username, password },
		})
		if (!user) return res.sendStatus(404)
		if (!user.active) return res.sendStatus(404)

		// creo il token e lo mando
		const token = await new Bus(this, "/jwt")
			.dispatch({ type: JWTActions.ENCODE, payload: user.id })
		res.json({ "access_token": token })
	}

}