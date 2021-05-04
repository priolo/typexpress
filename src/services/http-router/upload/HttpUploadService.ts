import express, { Request, Response, Router } from "express"
import { HttpRouterServiceBase } from "../HttpRouterServiceBase"
import multer from 'multer'
import fs from "fs"
import { log, LOG_TYPE } from "../../../utils/log"
import path from "path"

/**
 * middleware 
 * inserische un entry-point http per salvare un file sul server
 */
export class HttpUploadService extends HttpRouterServiceBase {

    get defaultConfig(): any {
        return {
            ...super.defaultConfig,
            name: "route-upload",   // string
            baseDir: "/",           // path dove inserire i files
            fields: { name: "file", /*,maxCount:3*/ }
        }
    }

    protected onBuildRouter(): Router {
        //super.onBuildRouter()
        const { baseDir, fields } = this.state
        const router = express.Router()

        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                const { dest } = req.body
                const dirDest = dest ? path.join(baseDir, path.parse(dest).dir) : baseDir

                if (!fs.existsSync(dirDest)) {
                    log(`Directory "${dirDest}" not found. I try to create it myself`, LOG_TYPE.INFO)
                    fs.mkdirSync(dirDest, { recursive: true })
                }

                cb(null, dirDest)
            },
            filename: function (req, file, cb) {
                const { dest } = req.body
                const fileDest = dest ?  path.parse(dest).base : file.originalname
                //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
                //cb(null, file.fieldname + '-' + uniqueSuffix)
                cb(null, fileDest)
            }
        })
        var upload = multer({ storage })

        //router.post("/", upload.fields(fields), (req: Request, res: Response, next) => {
        router.post("/", upload.any(), (req: Request, res: Response, next) => {
            res.sendStatus(200)
        })

        return router
    }
}