import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/repo/RepoRestActions"

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
        const router = super.onBuildRouter()
        const { path } = this.state

        // prelevo i dati della directory
        router.get(path, (req: Request, res: Response, next) => {
            const {dir} = req.params
        })


        return router
    }
}