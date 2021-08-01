import { RootService } from "./core/RootService"
import { Bus } from "./core/path/Bus"
import { PathFinder } from "./core/path/PathFinder"
import { RepoRestActions, RepoStructActions } from "./core/repo/utils";


import { HttpRouterService } from "./services/http-router/HttpRouterService"
import { HttpRouterRestServiceBase } from "./services/http-router/rest/HttpRouterRestServiceBase"
import { HttpRouterRestRepoService } from "./services/http-router/rest/HttpRouterRestRepoService"
import { HttpJWTUserService, RouteJWTUserActions, HeaderStrategy, CookieStrategy, CookieStrategyFarm } from "./services/http-router/jwt/HttpJWTUserService"


import * as service from "./core/service"
import * as email from "./services/email"
// import * as error from "./services/error"
// import * as farm from "./services/farm"
// import * as fs from "./services/fs"
// import * as http from "./services/http"
import * as typeorm from "./services/typeorm"
import * as ws from "./services/ws"



// CORE
export {
	RootService,
	Bus,
	PathFinder,
	RepoRestActions,
	RepoStructActions
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


// EXPORT 
export {
	Router,
	
	service,
	email,
	// error,
	// farm,
	// fs,
	// http,
	typeorm,
	ws,
}