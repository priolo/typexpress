import { Bus } from "core/path/Bus";
import { PathFinder } from "../../core/path/PathFinder";
import path from "path"
import { ConfActions } from "../../core/node/NodeConf";
import { RootService } from "../../core/RootService"
import { IEmailAccount } from "../../services/email/EmailService";
import { AuthRoute } from "./routers/AuthRoute";
import { UserRouteRest } from "./routers/UserRouteRest";
import { NodeRouteRest } from "./routers/NodeRouteRest";


const PORT = process.env.PORT || 8080;

(async ()=>{
	const root = new RootService()
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
							path: "/api",
							// Content-Type: application/json
							//// Accept: text/*;q=.5, application/json
							//req.accepts(['html', 'json'])
							children: [
								// è importante l'ordine! altrimenti fa subito il controllo jwt
								{ class: AuthRoute, name: "auth", path: "/auth" },
								{ 
									class: "http-router/jwt", path: "/", repository: "/typeorm/user", jwt: "/jwt",
									children: [
										{ class: UserRouteRest, name: "user", path: "/user", repository: "/typeorm/user" },
										{ class: NodeRouteRest, name: "node", path: "/node" },
									]
								},
							],
						},
						{
							class: "http-static",
							dir: path.join(__dirname, "../../../admin-client/build"),
							path: "/",
							spaFile: "index.html",
						},						
					]
				},
				{
					class: "jwt",
					secret: "secret_word!!!",
				},
				{
					class: "email",
					account: <IEmailAccount>{
						host: 'smtp.ethereal.email',
						port: 587,
						auth: {
							user: 'robin.cummerata65@ethereal.email',
							pass: 'EBnZ54KhH68uUKawGf'
						}
					},
				},
				{
					class: "typeorm",
					typeorm: {
						"type": "sqlite",
						"database": path.join(__dirname, "../../../admin-db/database.sqlite"),
						"synchronize": true,
						"logging": true,
						"entities": [path.join(__dirname, "./models/*.js")],
					},
					children: [
						{ class: "typeorm/repo", name: "user", model: "User" },
					]
				}
			]
		}
	})

	// let typeorm = await new PathFinder(root).getNode<any>("/typeorm")
	// console.log(typeorm)
})()
