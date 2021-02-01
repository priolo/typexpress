import {HttpRouterService} from "./HttpRouterService";
import {HttpRouterRestRepoService} from "./rest/HttpRouterRestRepoService";
import {HttpJWTUserService} from "./jwt/HttpJWTUserService";
import {HttpFsService} from "./fs/HttpFsService";
import {HttpUploadService} from "./upload/HttpUploadService";


export default HttpRouterService

export {
	HttpRouterRestRepoService as repo,
	HttpJWTUserService as jwt,
	HttpFsService as fss,
	HttpUploadService as upload,
}