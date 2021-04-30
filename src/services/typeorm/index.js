import { TypeormService } from "./TypeormService"
import { TypeormRepoService } from "./TypeormRepoService"
import { TypeormRepoTreeService } from "./TypeormRepoTreeService"
import { TypeormActions } from "./TypeormRepoBaseService"

export default TypeormService

export {
	TypeormRepoService as repo,
	TypeormRepoTreeService as tree,
	TypeormActions
}