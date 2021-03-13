import { RootService } from "./core/RootService"
import { Bus } from "./core/path/Bus"
import { PathFinder } from "./core/path/PathFinder"
import { RepoRestActions } from "./core/repo/RepoRestActions";
import { RepoStructActions } from "./core/repo/RepoStructActions";



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
	RepoRestActions,
	RepoStructActions
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

