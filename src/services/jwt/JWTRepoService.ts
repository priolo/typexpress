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
			[JWTActions.ENCODE]: (state, { payload, options }) => this.encode(payload, options),
			[JWTActions.DECODE]: async (state, payload) => this.decode(payload),
		}
	}

	/**
	 * Codifica un payload con delle opzioni
	 * @param payload 
	 * @param options https://github.com/auth0/node-jsonwebtoken#readme
	 * vedere anche: https://tools.ietf.org/html/rfc7519
	 * @returns 
	 */
	private encode(payload, options): string {
		return jwt.sign(payload, this.state.secret, options)
	}

	private decode(data: string): string {
		const { secret } = this.state
		try {
			return jwt.verify(data, secret) as string
		} catch (e) {
			return null
		}
	}

}