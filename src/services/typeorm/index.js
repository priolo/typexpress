import { TypeormService } from "./TypeormService"
import { TypeormRepoService } from "./TypeormRepoService"
import { TypeormRepoTreeService } from "./TypeormRepoTreeService"
import { TypeormActions } from "./utils"


export default TypeormService
export {
	TypeormService as Service,
	TypeormActions as Actions,
	TypeormRepoService as repo,
	TypeormRepoTreeService as tree,
}
export * from "./utils"