import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/RepoRestActions"

/**
 * DA COMPLETARE
 * Espone delle API
 * adatte alle operazioni su File System
 * 
 */
export class HttpFsService extends HttpRouterServiceBase {

    get defaultConfig(): any {
        return {
            ...super.defaultConfig,
            name: "route-fs",   // string
            fs: "",             // path-fs:request
            baseDir: "/",        // directory base
        }
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const { path } = this.state
        const router = express.Router()

        // prelevo i dati della directory
        router.get(path, (req: Request, res: Response, next) => {
            const {dir} = req.params
        })


        return router
    }
}