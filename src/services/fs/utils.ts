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

/**
 * Tipo di "FsItem"
 */
export enum FsType {
	FILE = 0, DIR
}

/**
 * Tipo di"item" presente in una directory
 */
export interface FsItem {
	/** nome del file o directory */
	name: string,
	/** tipo di item */
	type: FsType,
	/** path della directory che contiene questo item */
	parent: string,
}

/**
 * Informazioni di una "directory" tramite "getDirInfo"
 */
export interface DirInfo {
	/** dimensione totale della directory in bytes*/
	size: number,
	/** il file piu' vecchio della directory */
	fileOld: string,
}




/**
 * Restituisce alcune informazioni utili della directory
 * @param dir la directory dalle quali estrarre le info
 */
export async function getDirInfo(dir: string): Promise<DirInfo> {
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
 * @param path path assoluta della directory
 */
export async function createDirIfNotExist(path: string): Promise<void> {
	const exist = await getIfExists(path)
	if (exist) return
	log(`Directory "${path}" not found. I try to create it myself`, LOG_TYPE.INFO)
	fs.promises.mkdir(path, { recursive: true })
}

/**
 * Elimina una directory o un file se questo esiste altrimenti non fa nulla
 * @param pathItem la path della directory o del file
 * @param secure se true controlla che il file/dir non sia fuori dalla directory del processo
 */
export async function deleteIfExist(pathItem: string, secure: boolean = true): Promise<boolean> {
	if (secure && !isSubDir( process.cwd(), pathItem)) return false
	const exist = await getIfExists(pathItem)
	if (!exist) return false
	try {
		await fs.promises.rm(pathItem, { recursive: true, force: true })
		return true
	} catch (e) {
		return false
	}
}

/**
 * Restituisce true se il "parent" contiene "dir"
 * @param parent 
 * @param dir 
 */
export function isSubDir(parent, dir): boolean {
	const relative = path.relative(parent, dir)
	return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/**
 * Restituisce true se il file o dir esiste altrimenti false
 * @param path directory o file da verificare se esiste 
 */
export async function getIfExists(path: string): Promise<boolean> {
	try {
		await fs.promises.access(path, fs.constants.F_OK)
	} catch (err) {
		return false
	}
	return true
}