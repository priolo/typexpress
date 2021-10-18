import fs from "fs"
import path from "path"
import { log, LOG_TYPE } from "@priolo/jon-utils"

/**
 * ACTION per la gestione del FILE SYSTEM
 * fanno tutte riferimento alla "baseDir" 
 */
export enum Actions {

	/** 
	 * lista della directory 
	 * payload(:string) path directory
	*/
	LIST = "list",

	/** 
	 * crea una nuova directory 
	 * payload(:string) 
	 * */
	NEW_DIR = "newDir",

	MOVE = "move",
	RENAME = "rename",
	DELETE = "delete",
	NEW_TEXT = "newText",
	GET_TEXT = "getText",
}

export interface FsItem {
	name: string,
	type: FsType,
	parent: string,
}

export enum FsType {
	FILE = 0, DIR
}

/**
 * Restituisce alcune informazioni utili della directory
 * @param dir 
 * @returns size: all directory in bytes, fileOld:
 */
export async function getDirInfo(dir: string): Promise<any> {
	const files = await fs.promises.readdir(dir)
	let size = 0
	let fileOld = null
	let deltaOld = 0
	let now = Date.now()
	for (const file of files) {
		const stat = await fs.promises.stat(path.join(dir, file))
		size += stat.size
		const delta = Math.abs(now - stat.birthtimeMs)
		if (delta > deltaOld) {
			deltaOld = delta
			fileOld = file
		}
	}
	return { size, fileOld }
}

/**
 * Crea una directory se questa non esiste
 * se esiste non fa nulla
 * @param path 
 */
export async function createDirIfNotExist(path: string) {
	const exi = await getIfExists(path)
	if (!exi) {
		log(`Directory "${path}" not found. I try to create it myself`, LOG_TYPE.INFO)
		await fs.promises.mkdir(path, { recursive: true })
	}
}

/**
 * Restituisce true se il file o dir esiste altrimenti false
 * @param path 
 * @returns 
 */
export async function getIfExists(path: string): Promise<boolean> {
	try {
		await fs.promises.access(path, fs.constants.F_OK)
	} catch ( err ) {
		return false
	}
	return true
}