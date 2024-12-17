import { ServiceBase } from "../../core/service/ServiceBase.js"
import fs from "fs"
import path from "path"
import { Actions, FsItem, FsType } from "./utils.js"
import { createDirIfNotExist, deleteIfExist } from "./utils.js"


export default class FsService extends ServiceBase {

	get stateDefault(): any {
		return {
			...super.stateDefault,
			name: "fs",
			// directory che si vuole "gestire"
			baseDir: "/",
			// se non esiste la crea
			//createIfNotExist: false,
			// max size (0 = infinite) superato il quale cancella i file piu' vecchi
			//maxSize: 0,
		}
	}

	get executablesMap(): any {
		return {
			...super.executablesMap,

			[Actions.LIST]: (dir: string) => this.getList(dir),

			[Actions.NEW_DIR]: async (dir: string) => this.makeNewDir(dir),

			[Actions.RENAME]: async ({ dirOld, dirNew }) => this.rename(dirOld, dirNew),

			[Actions.DELETE]: async (dir: string) => this.makeDelete(dir),

			[Actions.NEW_TEXT]: async ({ dir, data }) => { },

			[Actions.GET_TEXT]: async (dir: string) => { },
		}
	}

	/**
	 * in base alla path di una dir restituisco la lista delle entità presenti (files e directories)
	 * @param dir 
	 * @returns 
	 */
	protected async getList(dir: string): Promise<FsItem[]> {
		if (!dir) throw "Parameter error"
		const { baseDir } = this.state
		const parentDir = path.join(baseDir, dir)

		const files = await fs.promises.readdir(parentDir, { withFileTypes: true })
		return files.map(file => <FsItem>({
			name: file.name,
			type: file.isFile() ? FsType.FILE : FsType.DIR,
			parent: parentDir,
		}))
	}

	/**
	 * Crea una nuova directory specificata nel parametro
	 * @param dir 
	 * @returns 
	 */
	protected async makeNewDir(dir: string): Promise<FsItem> {
		if (!dir) throw "Parameter error"
		const { baseDir } = this.state
		const dirComplete = path.join(baseDir, dir)

		await createDirIfNotExist(dirComplete)
		const dirParsed = path.parse(dirComplete)
		return {
			name: dirParsed.base,
			type: FsType.DIR,
			parent: path.relative(baseDir, dirParsed.dir),
		}
	}

	/**
	 * Rinomina una path cioe' vuol dire un file o una directory
	 * quindi puo' effettuare anche un "move"
	 * @param dirOld 
	 * @param dirNew 
	 */
	protected async rename(dirOld: string, dirNew: string) {
		if (!dirOld || !dirNew) throw "Parameter error"
		const { baseDir } = this.state
		const dOld = path.join(baseDir, dirOld)
		const dNew = path.join(baseDir, dirNew)

		await fs.promises.rename(dOld, dNew)
	}

	/**
	 * Cancella un file o una directory
	 * @param dir 
	 */
	protected async makeDelete(dir: string) {
		if (!dir) throw "Parameter error"
		const { baseDir } = this.state
		const dirComplete = path.join(baseDir, dir)

		await deleteIfExist(dirComplete)
	}

}
