import { PathFinder } from "../../../core/path/PathFinder.js"
import { RootService } from "../../../core/RootService.js"
import path from "path"
import fs from "fs"
import { createDirIfNotExist, deleteIfExist, getDirInfo, getIfExists } from "../utils.js"
import { wait } from "../../../test_utils.js"
import * as fsService from "../index.js"
import { fileURLToPath } from 'url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));
let root: RootService

beforeEach(async () => {
	root = await RootService.Start({
		class: "fs",
		baseDir: path.join(__dirname, "./"),
	})
})

afterAll(async () => {
	await RootService.Stop(root)

})

test("create dir and files", async () => {
	const fss = new PathFinder(root).getNode<fsService.Service>("/fs")
	expect(fss).toBeInstanceOf(fsService.Service)

	let res = await fss.dispatch({
		type: fsService.Actions.NEW_DIR,
		payload: "./testDir",
	})

	expect(res).toEqual({ name: "testDir", type: fsService.FsType.DIR, parent: "" })
})




test("utils: getDirInfo", async () => {
	// la path della dir per i test
	const dir = path.join(__dirname, "./testDir")

	//creo la dir per il test
	await createDirIfNotExist(dir)
	expect(await getIfExists(dir)).toBeTruthy()

	// ci butto dentro i files
	await fs.promises.writeFile(path.join(dir, "file1.txt"), "file1")
	await wait(500)
	await fs.promises.writeFile(path.join(dir, "file2.txt"), "file2")
	await fs.promises.writeFile(path.join(dir, "file3.txt"), "file3")

	// eseguo il test
	const {fileOld, size} = await getDirInfo(path.join(__dirname, "./testDir"))
	expect(fileOld).toBe("file1.txt")
	expect(size).toBe(15)

	// elimino la dir per i test
	const success = await deleteIfExist(dir)
	expect(success).toBeTruthy()
	expect(await getIfExists(dir)).toBeFalsy()
})

// test("get list file and dir", async () => {	

// 	const fss = new PathFinder(root).getNode<FsService>("/fs")

// 	let items = await fss.dispatch({
// 		type: FsActions.LIST,
// 		payload: "./testDir",
// 	})

// 	expect(items).toEqual([{name:"dir1"}])
// })