import {HttpRouterService} from "./HttpRouterService";
import {HttpRouterRestRepoService} from "./rest/HttpRouterRestRepoService";
import {HttpJWTUserService, RouteJWTUserActions} from "./jwt/HttpJWTUserService";
import {HttpFsService} from "./fs/HttpFsService";
import {HttpUploadService} from "./upload/HttpUploadService";
import {HttpSessionService} from "./session/HttpSessionService";


export default HttpRouterService

export {
	HttpRouterRestRepoService as repo,
	HttpJWTUserService as jwt,
	HttpFsService as fss,
	HttpUploadService as upload,
	HttpSessionService as session,
	RouteJWTUserActions,
}