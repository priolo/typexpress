import { RootService } from "./core/RootService"
import { Bus } from "./core/path/Bus"
import { PathFinder } from "./core/path/PathFinder"
//import { ServiceBase } from "core/ServiceBase"

import { TypeormService } 				from "./services/typeorm"
import { ModelBase } 					from "./services/typeorm/models/ModelBase"

import { HttpRouterService } 			from "./services/http-router/HttpRouterService"
import { HttpRouterRestServiceBase } 	from "./services/http-router/rest/HttpRouterRestServiceBase"
import { HttpRouterRestRepoService } 	from "./services/http-router/rest/HttpRouterRestRepoService"





// CORE
export {
	RootService,
	Bus,
	PathFinder,
}


// TYPEORM
const Typeorm = {
	Service: TypeormService,
	ModelBase 			// base model for repository (entity) typeorm
}
// ROUTER
const Router = {
	Service: HttpRouterService,
	Repo: HttpRouterRestRepoService,
	Rest: HttpRouterRestServiceBase,
}

export {
	Typeorm,
	Router,
}

