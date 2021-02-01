import { ServiceBase } from "../../core/ServiceBase"
import jwt from "jsonwebtoken";


export enum JWTActions {
	ENCODE = "encode",
	DECODE = "decode",
}

export class JWTRepoService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "jwt",
			secret: "pippo"
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[JWTActions.ENCODE] : (state, payload) => jwt.sign(payload, this.state.secret),
			[JWTActions.DECODE]: async (state, payload) => {
				try{
					return jwt.verify(payload, this.state.secret)
				} catch ( e ) {
					return null
				}
			},
		}
	}

}