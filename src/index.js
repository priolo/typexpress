import { RootService } from "./core/RootService"
import { Bus } from "./core/path/Bus"
import { PathFinder } from "./core/path/PathFinder"
import { RepoRestActions } from "./core/repo/RepoRestActions";
import { RepoStructActions } from "./core/repo/RepoStructActions";

import TypeormService, { repo, TypeormActions } from "./services/typeorm"
import { ModelBase } from "./services/typeorm/models/ModelBase"

import { HttpRouterService } from "./services/http-router/HttpRouterService"
import { HttpRouterRestServiceBase } from "./services/http-router/rest/HttpRouterRestServiceBase"
import { HttpRouterRestRepoService } from "./services/http-router/rest/HttpRouterRestRepoService"
import { HttpJWTUserService, RouteJWTUserActions, HeaderStrategy, CookieStrategy, CookieStrategyFarm } from "./services/http-router/jwt/HttpJWTUserService"

import EmailService, { EmailActions } from "./services/email"

import * as WS from "./services/ws"


// CORE
export {
	RootService,
	Bus,
	PathFinder,
	RepoRestActions,
	RepoStructActions
}

// TYPEORM
const Typeorm = {
	Service: TypeormService,
	ModelBase, 			// base model for repository (entity) typeorm
	Repo: repo,
	Actions: TypeormActions,
}

// ROUTER
const Router = {
	Service: HttpRouterService,
	Repo: HttpRouterRestRepoService,
	Rest: HttpRouterRestServiceBase,
	JWT: {
		Route: HttpJWTUserService,
		Action: RouteJWTUserActions,
		Strategies: {
			Header: HeaderStrategy,
			Cookie: CookieStrategy,
			CookieFarm: CookieStrategyFarm,
		}
	}
}

// EMAIL
const Email = {
	Service: EmailService,
	Actions: EmailActions,
}

// EXPORT 
export {
	Typeorm,
	Router,
	Email,
	WS
}