import fs from 'fs';
import p from 'path';
import { fileURLToPath } from 'url';
import { INode } from "../../core/node/INode.js";
import { Node } from "../../core/node/Node.js";
import { NodeConf } from "../../core/node/NodeConf.js";



const __dirname = p.dirname(fileURLToPath(import.meta.url));
//const nodeModulesPath = p.resolve(__dirname, '../../node_modules');

/**
 * Il SEVICE che si occupa di caricare l'array di classi presenti in un file js
 */
export default class FarmService extends Node {

    name: string = "farm"

    /**
     * Restituisce la path assoluta e il nome della classe da caricare
     * la path è divisa in:
     * [repository]:[path]/[class_name]
     * - repository
     * `void`: usa la cartella locale "services"
     * `npm`: usa il repository npm
     */
    private async loadClassFromFile(fullPath: string): Promise<any> {
        if (fullPath == null) return null

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
            throw new Error("classe non trovata")
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
    }

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