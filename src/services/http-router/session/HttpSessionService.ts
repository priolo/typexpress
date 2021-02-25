import { Bus } from "core/path/Bus"
import express, { Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import session from 'express-session'
import TypeormService from "services/typeorm"
import { PathFinder } from "core/path/PathFinder"
import { TypeormStore } from "connect-typeorm";
import { TIMEOUT } from "dns"


/**
 * middleware 
 * gestisce una session
 */
export class HttpSessionService extends HttpRouterServiceBase {

    get defaultConfig(): any {
        return {
            ...super.defaultConfig,
            name: "route-session",  // string
            // https://github.com/expressjs/session#options
            options: {
                secret: "a secret string",
                resave: false,
                saveUninitialized: false,
                cookie: { maxAge: 60000 }
            },
            typeorm: null,
        }
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const { options, typeorm } = this.state

        if (typeorm) {
            const nodeTypeorm = new PathFinder(this).getNode<TypeormService>(typeorm)
            nodeTypeorm.
            const connection = nodeTypeorm.connection
            const repository = connection.getRepository(Session)

            options.store = new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false, // If using MariaDB.
                ttl: 86400
            }).connect(repository)
        }

        const router = express.Router()
        
        const store = session(options)
        router.use(store)

        // setTimeout( ()=>{
        //     router.use(store)
        // }, 1000)
        
        return router
    }
}