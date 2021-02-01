/* eslint eqeqeq: "off" */
import users from "./users"
import auth from "./auth"


export const handlers = [
	...auth,
	...users,
]

