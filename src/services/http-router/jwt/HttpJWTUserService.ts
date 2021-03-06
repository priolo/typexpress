import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/repo/RepoRestActions"

export enum RouteJWTUserActions {
    TOKEN_BY_ID = "token-by-id",
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
            repository: "",     // path-repo:request
            jwt: "",            // path-jwt:request
        }
    }

    get dispatchMap(): any {
        return {
            ...super.dispatchMap,
            [RouteJWTUserActions.TOKEN_BY_ID]: (state, id) => this.getTokenById(id),
        }
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const router = express.Router()

        router.use(async (req: Request, res: Response, next) => {
            const { token } = req.cookies
            const { repository, jwt } = this.state

            // se non c'e' il token emetto un errore
            if (!token) return res.sendStatus(401)

            // decodifico l'id dell'utente
            const id = await new Bus(this, jwt)
                .dispatch({ type: JWTActions.DECODE, payload: token })

            // se non sono riusito a decodificarlo ... errore!
            if (!id) return res.sendStatus(401)

            // prelevo l'utente
            let user = await new Bus(this, repository).dispatch({
                type: RepoRestActions.GET_BY_ID,
                payload: id,
            })

            // se non c'e' utente allora emetto un errore 401
            if (!user) return res.sendStatus(401)

            // inserisco l'utente nel messaggio request e continuo nei router express
            req["user"] = user
            next()
        })

        return router
    }

    private async getTokenById(id) {
        const { jwt } = this.state
        const token = await new Bus(this, jwt).dispatch({
            type: JWTActions.ENCODE,
            payload: id,
        })
        return token
    }
}