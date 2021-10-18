import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import path from "path"
import * as fs from "../index"
import { getDirInfo } from "../utils"


let root: RootService = null

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
	const fss = new PathFinder(root).getNode<fs.Service>("/fs")
	expect(fss).toBeInstanceOf(fs.Service)

	let res = await fss.dispatch({
		type: fs.Actions.NEW_DIR,
		payload: "./testDir",
	})

	expect(res).toEqual({ name: "testDir", type: fs.FsType.DIR, parent: "" })
})

test("util getDirInfo", async () => {
	const {fileOld, size} = await getDirInfo(path.join(__dirname, "./testDir"))
	expect(fileOld).toBe("example1.txt")
	expect(size).toBe(47679)

})

// test("get list file and dir", async () => {	

// 	const fss = new PathFinder(root).getNode<FsService>("/fs")

// 	let items = await fss.dispatch({
// 		type: FsActions.LIST,
// 		payload: "./testDir",
// 	})

// 	expect(items).toEqual([{name:"dir1"}])
// })