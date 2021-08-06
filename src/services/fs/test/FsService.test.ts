import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { ConfActions } from "../../../core/node/utils"
import path from "path"

import * as fs from "../index"



let root = null

beforeEach(async () => {
	root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "fs",
					baseDir: path.join(__dirname, "./"),
				},
			]
		}
	})
})
afterAll(async () => {
	await root.dispatch({ type: ConfActions.STOP })
})


test("create dir and files", async () => {
	const fss = new PathFinder(root).getNode<fs.Service>("/fs")
	expect(fss).toBeInstanceOf(fs.Service)

	let res = await fss.dispatch({
		type: fs.Actions.NEW_DIR,
		payload: "./testDir",
	})

	expect(res).toEqual({name: "testDir", type: fs.FsType.DIR, parent: ""})
})

// test("get list file and dir", async () => {	

// 	const fss = new PathFinder(root).getNode<FsService>("/fs")

// 	let items = await fss.dispatch({
// 		type: FsActions.LIST,
// 		payload: "./testDir",
// 	})

// 	expect(items).toEqual([{name:"dir1"}])
// })