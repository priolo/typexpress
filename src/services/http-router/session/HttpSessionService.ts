import express, { Router } from "express"

import { PathFinder } from "../../../core/path/PathFinder"
import { IEvent, ServiceBaseEvents } from "../../../core/service/index"

import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import session from 'express-session'
import {TypeormService} from "../../typeorm/TypeormService"
import { TypeormStore } from "connect-typeorm";
import { SessionEntity } from "./SessionEntity"


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

    private store:any = null

    protected async onInitFinish(): Promise<void> {
        const { typeorm, options } = this.state 

        if ( typeorm ) {
            const nodeTypeorm = new PathFinder(this).getNode<TypeormService>(typeorm)
            const connection = nodeTypeorm.connection
            const repository = connection.getRepository(SessionEntity)
            options.store = new TypeormStore({
                cleanupLimit: 2,
                limitSubquery: false, // If using MariaDB.
                ttl: 86400
            }).connect(repository)
        }
        
        this.store = session(options)

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
        }
    }

    protected onBuildRouter(): Router {
        const router = super.onBuildRouter()
        const { options, typeorm } = this.state
 
        router.use(async (req,res,next)=>{
            if ( this.store ) {
                this.store(req,res,next)
                return
            }
            next()
        })

        return router
    }
}