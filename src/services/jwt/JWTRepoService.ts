import { ServiceBase } from "../../core/ServiceBase"
import jwt, { Secret } from "jsonwebtoken";


export enum JWTActions {
	ENCODE = "encode",
	DECODE = "decode",
}

export class JWTRepoService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "jwt",
			secret: "secret_word"
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[JWTActions.ENCODE]: (state, payload) => this.encode(payload),
			[JWTActions.DECODE]: async (state, payload) => this.decode(payload),
		}
	}

	private encode(data): string {
		return jwt.sign(data, this.state.secret)
	}

	private decode(data: string): string {
		const secret:string = this.state.secret
		try {
			return jwt.verify(data, secret) as string
		} catch (e) {
			return null
		}
	}

}