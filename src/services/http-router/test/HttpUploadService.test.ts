/**
 * @jest-environment node
 */
import axios from "axios"
import fs from "fs"
import path from "path"
import FormData from "form-data"

import { ConfActions } from "../../../core/node/utils"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"

import { HttpUploadService } from "../upload/HttpUploadService"



axios.defaults.adapter = require('axios/lib/adapters/http')
const PORT = 5006
const axiosIstance = axios.create({ baseURL: `http://localhost:${PORT}`, withCredentials: true });
let root = null
const dirDest = path.join(__dirname, "./dest")

beforeAll(async () => {
	// create node
	root = await RootService.Start({
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
	await RootService.Stop(root)
})



test("su creazione", async () => {
	const test = new PathFinder(root).getNode<HttpUploadService>("/http/route-upload")
	expect(test).toBeInstanceOf(HttpUploadService)
})

test("upload multiple files", async () => {

	const fileDest1 = path.join(dirDest, "./file1.json")
	const fileSurce1 = path.join(__dirname, './file1.json')
	const fileDest2 = path.join(dirDest, "./file2.json")
	const fileSurce2 = path.join(__dirname, './file2.json')

	const form = new FormData();
	form.append("file1", fs.createReadStream(fileSurce1));
	form.append("file2", fs.createReadStream(fileSurce2));
	const { data } = await axiosIstance.post(`/upload`, form, { headers: form.getHeaders() })

	expect(fs.existsSync(fileDest1)).toBeTruthy()
	expect(fs.existsSync(fileDest2)).toBeTruthy()
})

test("upload file with path", async () => {

	const fileSource = path.join(__dirname, "./file1.json")
	const fileDestRelative = "./subdir/file.txt"
	const fileDestAbsolute = path.join(__dirname, "./dest", fileDestRelative)
	expect(fs.existsSync(fileDestAbsolute)).toBeFalsy()

	const form = new FormData();
	// deve stare prima del file altrimenti fallisce!
	form.append("dest", fileDestRelative) //{ "file1": fileDestRelative } )
	form.append("file1", fs.createReadStream(fileSource));
	const { data } = await axiosIstance.post(`/upload`, form, { headers: form.getHeaders() })

	expect(fs.existsSync(fileDestAbsolute)).toBeTruthy()
})
