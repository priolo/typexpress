import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/repo/RepoRestActions"


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
            repository: "",     // path-repo:request
            strategy: null,     // strategia da attuare per il login
        }
    }

    get dispatchMap(): any {
        return {
            ...super.dispatchMap,
            [RouteJWTUserActions.GENERATE_TOKEN]: (state, payload) => this.generateToken(payload),
        }
    }

    private get strategy(): any {
        return this.state.strategy ?? CookieStrategy
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const router = express.Router()

        router.use(async (req: Request, res: Response, next) => {
            const { jwt } = this.state

            // prelevo il token
            const token = await this.strategy.getToken(req)

            // se non c'e' il token emetto un errore
            if (!token) return res.sendStatus(401)

            // decodifico il jwt
            const payload = await new Bus(this, jwt)
                .dispatch({ type: JWTActions.DECODE, payload: token })
            // se non sono riusito a decodificarlo ... errore!
            if (!payload) return res.sendStatus(401)

            // prelevo l'utente
            const user = await this.strategy.getUser(req, payload, this)

            // se non c'e' utente allora emetto un errore 401
            if (!user) return res.sendStatus(401)

            // inserisco l'utente nel messaggio request e continuo nei router express
            req["user"] = user
            next()
        })

        return router
    }


    protected async generateToken(payload) : Promise<string> {
        const { jwt } = this.state
        return new Bus(this, jwt).dispatch({
            type: JWTActions.ENCODE,
            payload: { payload, options: { expiresIn: "1h" } },
        })
    }

}

export const CookieStrategy = {
    getToken: (req: Request) => {
        const { token } = req.cookies
        return token
    },
    getUser: (req: Request, payload: any, node: HttpJWTUserService) => {
        return payload
    }
}

export const HeaderStrategy = {
    getToken: (req: Request) => {
        let token = req.headers["authorization"]?.slice(7)
        return token && token.length > 0 ? token : null
    },
    getUser: async (req: Request, payload: any, node: HttpJWTUserService) => {
        const { repository } = node.state
        const user = await new Bus(node, repository).dispatch({
            type: RepoRestActions.GET_BY_ID,
            payload: payload?.id,
        })
        return user
    }
}

