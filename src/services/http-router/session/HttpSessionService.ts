import express, { Router } from "express"

import { Bus } from "../../../core/path/Bus"
import { PathFinder } from "../../../core/path/PathFinder"
import { IEvent, ServiceBase, ServiceBaseActions, ServiceBaseEvents } from "../../../core/ServiceBase"
import { nodePath } from "../../../core/utils"

import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import session from 'express-session'
import {TypeormService} from "../../typeorm/TypeormService"
import { TypeormStore } from "connect-typeorm";


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

    protected async onInitFinish(): Promise<void> {
        const { typeorm } = this.state 
        if ( !typeorm ) return
        debugger
        const typeormService = new PathFinder(this).getNode<TypeormService>(typeorm)
        debugger
        // new Bus(this, typeorm).dispatch({ 
        //     type: ServiceBaseActions.REGISTER, 
        //     payload: ServiceBaseEvents.INIT_AFTER,
        //     wait: 2000,
        // } )
    }

    protected onEvent(event: IEvent): void { 
        const { typeorm } = this.state 

        if ( typeorm && event.source==typeorm && event.name==ServiceBaseEvents.INIT_AFTER ) {
            console.log( "connection ok!!" )
            debugger
        }
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const { options, typeorm } = this.state

        const router = express.Router()
        
        const store = session(options)

        router.use(async (req,res,next)=>{
            // if (typeorm) {
            //     const nodeTypeorm = new PathFinder(this).getNode<TypeormService>(typeorm)
            //     const connection = nodeTypeorm.connection
            //     const repository = connection.getRepository(Session)

            //     options.store = new TypeormStore({
            //         cleanupLimit: 2,
            //         limitSubquery: false, // If using MariaDB.
            //         ttl: 86400
            //     }).connect(repository)
            // }
            store(req,res,next)
        })

        return router
    }
}