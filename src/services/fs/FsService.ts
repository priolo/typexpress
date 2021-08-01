import { ServiceBase } from "../../core/service/ServiceBase"
import fs from "fs"
import path from "path"
import { FsActions, FsItem, FsType } from "./utils"


export class FsService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "fs",  // string
			baseDir: "/",
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,

			[FsActions.LIST]: async (state, dir: string) => {
				const { baseDir } = this.state
				const d = path.join(baseDir, dir)
				const files = await fs.promises.readdir(d, { withFileTypes: true })
				return files.map(file => <FsItem>({
					name: file.name,
					type: file.isFile() ? FsType.FILE : FsType.DIR,
					parent: d,
				}))
			},
			[FsActions.NEW_DIR]: async (state, dir: string) => {
				const d = path.join(this.state.baseDir, dir)
				await fs.promises.mkdir(d, { recursive: true })
				const newDP = path.parse(d)
				return {
					name: newDP.base,
					type: FsType.DIR,
					parent: path.relative(this.state.baseDir, newDP.dir),
				}
			},
			[FsActions.MOVE]: async (state, dir: string) => {
				//return await fs.promises.mkdir(dir, { recursive: true })
			},
			[FsActions.RENAME]: async (state, { dirOld, dirNew }) => {
				const dOld = path.join(this.state.baseDir, dirOld)
				const dNew = path.join(this.state.baseDir, dirNew)
				await fs.promises.rename(dOld, dNew)
			},
			[FsActions.DELETE]: async (state, dir: string) => {
				const d = path.join(this.state.baseDir, dir)
				await fs.promises.unlink(d)
			},
			[FsActions.NEW_TEXT]: async (state, {dir,data}) => {
				
			},
			[FsActions.GET_TEXT]: async (state, dir: string) => {
				
			},
		}
	}
}
