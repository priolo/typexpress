import { ServiceBase } from "../../core/ServiceBase"
import jwt, { Secret } from "jsonwebtoken";


export enum JWTActions {
	/**
	 * PAYLOAD -> JWT-TOKEN  
	 * payload= `{ payload:json-like, options: https://github.com/auth0/node-jsonwebtoken#usage}`
	 */
	ENCODE = "encode",
	/**
	 * JWT-TOKEN -> PAYLOAD
	 * payload= `token: string`
	 */
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
	 * Codifica un PAYLOAD con delle opzioni in un JWT-TOKEN
	 * @param payload tipicamente un oggetto json-like
	 * @param options https://github.com/auth0/node-jsonwebtoken#usage
	 * vedere anche: https://tools.ietf.org/html/rfc7519
	 * @returns 
	 */
	private encode(payload:string | object | Buffer, options:jwt.SignOptions): string {
		return jwt.sign(payload, this.state.secret, options)
	}

	/**
	 * Decodifica un JWT-TOKEN in un oggetto originale
	 * @param token 
	 * @returns 
	 */
	private decode(token: string): string {
		const { secret } = this.state
		try {
			return jwt.verify(token, secret) as string
		} catch (e) {
			return null
		}
	}

}