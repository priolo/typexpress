import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/repo/RepoRestActions"


export enum RouteJWTUserActions {
    LOGIN = "login",
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

            strategy: null,

            repository: "",     // path-repo:request
        }
    }

    get dispatchMap(): any {
        return {
            ...super.dispatchMap,
            [RouteJWTUserActions.LOGIN]: (state, { id, res }) => this.strategy.login(id, res)(this),
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

    // private async getTokenById(id) {
    //     const { jwt } = this.state
    //     const token = await new Bus(this, jwt).dispatch({
    //         type: JWTActions.ENCODE,
    //         payload: id,
    //     })
    //     return token
    // }
}

export const CookieStrategy = {
    login: (id, res) => async (node: HttpJWTUserService) => {
        const { repository, jwt } = node.state

        // get user
        const user = await new Bus(node, repository).dispatch({
            type: RepoRestActions.GET_BY_ID,
            payload: id,
        })
        // create token
        const token = await new Bus(node, jwt).dispatch({
            type: JWTActions.ENCODE,
            payload: { payload: user, options: { expiresIn: "1h" } },
        })
        // lo metto nei cookie
        res.cookie('token', token, { maxAge: 900000, httpOnly: true });
    },
    getToken: (req: Request) => {
        const { token } = req.cookies
        return token
    },
    getUser: (req: Request, payload: string, node: HttpJWTUserService) => {
        return payload
    }
}

export const HeaderStrategy = {
    login: (id, res) => async (node: HttpJWTUserService) => {
        const { jwt } = node.state
        return await new Bus(node, jwt).dispatch({
            type: JWTActions.ENCODE,
            payload: { payload: id },
        })
    },
    getToken: (req: Request) => {
        let token = req.headers["authorization"]?.slice(7)
        return token && token.length > 0 ? token : null
    },
    getUser: async (req: Request, payload: string, node: HttpJWTUserService) => {
        const { repository } = node.state
        const user = await new Bus(node, repository).dispatch({
            type: RepoRestActions.GET_BY_ID,
            payload: payload,
        })
        return user
    }
}




// export async function GetUserFromRepo(req: Request, payload: string, node: HttpJWTUserService) {
//     const { repository } = node.state
//     const user = await new Bus(node, repository).dispatch({
//         type: RepoRestActions.GET_BY_ID,
//         payload: payload,
//     })
//     return user
// }