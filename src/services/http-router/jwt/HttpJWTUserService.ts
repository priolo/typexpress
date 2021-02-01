import { Bus } from "../../../core/path/Bus"
import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import { JWTActions } from "../../jwt/JWTRepoService"
import { RepoRestActions } from "../../../core/RepoRestActions"

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

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const router = express.Router()

        router.use(async (req: Request, res: Response, next) => {
            const { token } = req.cookies
            const { repository, jwt } = this.state

            // se non c'e' il token emetto un errore
            if ( !token ) return res.sendStatus(401)

            // ricavo l'id dell'utente
            const id = await new Bus(this, jwt)
                .dispatch({ type: JWTActions.DECODE, payload: token })

            // se non sono riusito a decodificarlo ... errore!
            if ( !id ) return res.sendStatus(401)
                
            // prelevo l'utente
            let user = await new Bus(this, repository).dispatch({
                type: RepoRestActions.GET_BY_ID,
                payload: id,
            })

            // se non c'e' utente allora emetto un errore 401
            if ( !user ) return res.sendStatus(401)

            req["user"] = user

            next()
        })

        return router
    }
}