import { INode } from "../../core/node/INode.js"
import { Node } from "../../core/node/Node.js"
import { NodeConf } from "../../core/node/NodeConf.js"
import p from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';


const __dirname = p.dirname(fileURLToPath(import.meta.url));
//const nodeModulesPath = p.resolve(__dirname, '../../node_modules');

/**
 * Il SEVICE che si occupa di caricare l'array di classi presenti in un file js
 */
export default class FarmService extends Node {

    name: string = "farm"

    /**
     * Carico una specifica classe
     * "<path>": è la classe di default che si trova nella cartella "/services/<path>"
     * "<path>/<name>": è una classe che si trova nella cartella "/services/<path>" esportata, nell' "index.ts" col nome "<name>"
     * "<alias>/<path>": va caricata a seconda dell'alias [II] NON IMPLEMENTATO
     * @param path 
     */
    private async loadClassFromFile(path: string): Promise<any> {
        if (path == null) return null

        return await this.getClassFromString(path)

        // const { path: loc, className } = this.getClassFromString(path)
        // let classes = null
        // const fileUrl = pathToFileURL(loc).href;

        // if (fileUrl.endsWith(".js") || fileUrl.endsWith(".ts")) {
        //     const clazz = await import(fileUrl)
        //     return clazz.default ?? clazz
        // } else {
        //     try {
        //         classes = await import(`${fileUrl}\\index.js`)
        //     } catch (e) {
        //         try {
        //             classes = await import(fileUrl)
        //         } catch (e) {
        //             try {
        //                 classes = await import(`${fileUrl}\\index`)
        //             } catch (e) {
        //                 console.error(e)
        //                 return null
        //             }
        //         }
        //     }
        // }
        // if (!classes) {
        //     console.error("classe non trovata")
        //     return null
        // }

        // // se è definito un "className" prendo la class con quel "className"
        // if (className) {
        //     const clazz = classes[className]
        //     return clazz.default ?? clazz
        // }

        // // ... altrimenti prendo la prima della lista (iniziando per defualt se c'e')
        // return Object.keys(classes)
        //     .sort(k => k == "default" ? -1 : 1)
        //     .map(k => classes[k])[0]
    }

    /**
     * Restituisce la path assoluta e il nome della classe da caricare
     * la path è divisa in:
     * [repository]:[path]/[class_name]
     * - repository
     * `void`: usa la cartella locale "services"
     * `npm`: usa il repository npm
     */
    private async getClassFromString(fullPath: string): Promise<any> {
        const [repo, pathAndClass] = splitOne(fullPath, ":")
        const [path, className] = splitOne(pathAndClass, "/", true)

        let module = null

        if (repo == "npm") {
            const rootPath = findProjectRoot(__dirname)
            module = await import(p.resolve(rootPath, 'node_modules', path));
        } else {
            module = await import(p.resolve(__dirname, "..", path));
        }

        if (!module) {
            console.error("classe non trovata")
            return null
        }

        // se è definito un "className" prendo la class con quel "className"
        if (className) {
            const clazz = module[className]
            return clazz.default ?? clazz
        }

        // ... altrimenti prendo la prima della lista (iniziando per defualt se c'e')
        return Object.keys(module)
            .sort(k => k == "default" ? -1 : 1)
            .map(k => module[k])[0]




        // const index = fullPath.indexOf("/")
        // const [alias, name] = index == -1
        //     ? ["", fullPath]
        //     : [index == 0 ? "/" : fullPath.slice(0, index), fullPath.slice(index + 1)]

        // if ([".", "..", "/", "@"].indexOf(alias) != -1) {
        //     return { path: fullPath }
        // }
        // return {
        //     path: p.join(__dirname, "..", alias == "" ? fullPath : alias),
        //     className: alias == "" ? undefined : name
        // }
    }




    //#endregion


    /**
     * Costruisce un SERVICE in base ad una configurazione
     */
    public async build(config: any): Promise<INode | null> {

        // se è una "function" suppongo sia una classe da istanziare
        if (typeof (config.class) == "function") {
            return <INode>new config.class()
        }

        // se è un istanza "object" allora la uso direttamente
        if (typeof (config.class) == "object") {
            return <INode>config.class
        }

        // è una stringa devo caricare ...
        if (typeof (config.class) == "string") {
            // cerco nelle varie cartelle
            const clazz = await this.loadClassFromFile(config.class)
            if (clazz != null) return <INode>new clazz()
        }

        // se è qualunque altra cosa (per esempio null) restituisco un nodo di "default"
        return new NodeConf("node-error")
    }
}


function splitOne(str: string, div: string, null2: boolean = false): [string, string] {
    const index = str.indexOf(div)
    if (index == -1) return null2 ? [str, null] : [null, str]
    return [str.slice(0, index), str.slice(index + 1)]
}

function findProjectRoot(currentDir:string):string {
    const rootPath = p.parse(currentDir).root;
    while (currentDir !== rootPath) {
        if (fs.existsSync(p.join(currentDir, 'package.json'))) {
            return currentDir;
        }
        currentDir = p.dirname(currentDir);
    }
    return null;
}