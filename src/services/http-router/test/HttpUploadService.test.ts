/**
 * @jest-environment node
 */

import axios from "axios"
import { ConfActions } from "../../../core/node/NodeConf"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import { HttpUploadService } from "../upload/HttpUploadService"
import fs from "fs"
import path from "path"
import FormData from "form-data"


let root = null
const dirDest = path.join(__dirname, "./dest")
const PORT = 5006

beforeAll(async () => {
	// axios
	axios.defaults.adapter = require('axios/lib/adapters/http')

	// create node
	root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "http",
					port: PORT,
					children: [
						{
							path: "/upload",
							baseDir: path.join(__dirname, "/dest"),
							fields: "file",
							class: "http-router/upload",
						},
					]
				}
			]
		}
	})
})

beforeEach(async () => {
	// remove and recreate dir destination
	fs.rmdirSync(dirDest, { recursive: true })
	expect(fs.existsSync(dirDest)).toBeFalsy()
})

afterAll(async () => {
	await root.dispatch({ type: ConfActions.STOP })
})



test("su creazione", async () => {
	const test = new PathFinder(root).getNode<HttpUploadService>("/http/route-upload")
	expect(test).toBeInstanceOf(HttpUploadService)
})

test("upload multiple files", async () => {

	const fileDest1 = path.join(dirDest, "./HttpUploadService.test.js")
	const fileSurce1 = path.join(__dirname, './HttpUploadService.test.js')
	const fileDest2 = path.join(dirDest, "./HttpRouterService.test.js")
	const fileSurce2 = path.join(__dirname, './HttpRouterService.test.js')

	const form = new FormData();
	form.append("file1", fs.createReadStream(fileSurce1));
	form.append("file2", fs.createReadStream(fileSurce2));
	const { data } = await axios.post(`http://localhost:${PORT}/upload`, form, { headers: form.getHeaders() })

	expect(fs.existsSync(fileDest1)).toBeTruthy()
	expect(fs.existsSync(fileDest2)).toBeTruthy()
})

test("upload file with path", async () => {

	const fileSource = path.join(__dirname, "./HttpRouterService.test.js")
	const fileDestRelative = "./subdir/file.txt"
	const fileDestAbsolute = path.join(__dirname, "./dest", fileDestRelative)
	expect(fs.existsSync(fileDestAbsolute)).toBeFalsy()

	const form = new FormData();
	// deve stare prima del file altrimenti fallisce!
	form.append("dest", fileDestRelative) //{ "file1": fileDestRelative } )
	form.append("file1", fs.createReadStream(fileSource));
	const { data } = await axios.post(`http://localhost:${PORT}/upload`, form, { headers: form.getHeaders() })

	expect(fs.existsSync(fileDestAbsolute)).toBeTruthy()
})
