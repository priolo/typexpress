import { TypeormService } from "./TypeormService"
import { TypeormRepoService } from "./TypeormRepoService"
import { TypeormRepoTreeService } from "./TypeormRepoTreeService"

export default TypeormService

export {
	TypeormRepoService as repo,
	TypeormRepoTreeService as tree,
}