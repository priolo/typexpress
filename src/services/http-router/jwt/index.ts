import {HttpJWTUserService} from "./HttpJWTUserService"
import {
	JWT_PAYLOAD_PROP, RouteJWTUserActions, CookieStrategyFarm, CookieStrategy,
	HeaderStrategy, JWTStrategy
} from "./utils"

export default HttpJWTUserService

export {
	HttpJWTUserService as Service,
	RouteJWTUserActions as Actions,

	JWT_PAYLOAD_PROP, 
	CookieStrategyFarm, 
	CookieStrategy,
	HeaderStrategy, 
}
