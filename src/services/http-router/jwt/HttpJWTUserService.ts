import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"



export const JWT_PAYLOAD_PROP = "jwtPayload"

export enum RouteJWTUserActions {
    GENERATE_TOKEN = "generate_token",
}


/**
 * middleware 
 * permette di creare l'USER tramite TOKEN
 */
export class HttpJWTUserService extends HttpRouterServiceBase {

    get defaultConfig(): any {
        return {
            ...super.defaultConfig,
            name: "route-jwt",  // string
            // la path del jwt che si occupa di codificare/decodificare
            jwt: "",            // path-jwt:request
            strategy: CookieStrategy,     // strategia da attuare per il login
        }
    }

    get dispatchMap(): any {
        return {
            ...super.dispatchMap,
            [RouteJWTUserActions.GENERATE_TOKEN]: (state, payload) => this.generateToken(payload),
        }
    }

    
    protected onBuildRouter(): Router {
        const router = super.onBuildRouter()

        router.use(async (req: Request, res: Response, next) => {
            const { jwt, strategy } = this.state

            // prelevo il token
            const token = await strategy.getToken(req)

            // se non c'e' il token emetto un errore
            if (!token) return res.sendStatus(401)

            // decodifico il jwt
            const payload = await new Bus(this, jwt)
                .dispatch({ type: JWTActions.DECODE, payload: token })
            // se non sono riusito a decodificarlo ... errore!
            if (!payload) return res.sendStatus(401)

            // inserisco il payload nel messaggio request e continuo nei router express
            req[JWT_PAYLOAD_PROP] = payload
            next()
        })

        return router
    }

    /**
     * Genera il TOKEN JWT in base al payload passato come parametro
     * @param payload 
     * @returns 
     */
    protected async generateToken(payload:any) : Promise<string> {
        const { jwt } = this.state
        return new Bus(this, jwt).dispatch({
            type: JWTActions.ENCODE,
            payload: { payload, options: { expiresIn: "1h" } },
        })
    }

    /** 
     * quando il LOGIN ha avuto successo 
     * valorizzo il parametro "payload" (generalmente l'user loggato)
     * e ricevo il TOKEN JWT
     */
    public async putPayload(payload:any, res:Response) : Promise<string> {
        const { strategy } = this.state
        const token = await this.generateToken(payload)
        strategy.putToken(token, res)
        return token
    }

}

/** Genera una STRATEGY di tipo COOKIE per la gestione del JWT */
export function CookieStrategyFarm(options):JWTStrategy {
    return {
        getToken: (req: Request) => {
            const { token } = req.cookies
            return token
        },
        putToken: ( token:string, res:Response) => {
            res.cookie('token', token, options)
        },
    }
}

/** STRATEGY di default per la gestione COOKIES del JWT */
export const CookieStrategy:JWTStrategy = CookieStrategyFarm({ 
    maxAge: 900000, 
    httpOnly: true,
    //domain: "localhost:8080"
})

/** STRATEGY per la gestione HEAD del JWT */
export const HeaderStrategy:JWTStrategy = {
    getToken: (req: Request) => {
        let token = req.headers["authorization"]?.slice(7)
        return token && token.length > 0 ? token : null
    },
    putToken: ( token:string, res:Response) => {
    },
}

export interface JWTStrategy {
    getToken (req:Request)
    putToken ( token:string, res:Response )
}