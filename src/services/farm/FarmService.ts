import { INode } from "../../core/node/INode.js"
import { Node } from "../../core/node/Node.js"
import { NodeConf } from "../../core/node/NodeConf.js"
import p from 'path';
import { fileURLToPath, pathToFileURL } from 'url';


const __dirname = p.dirname(fileURLToPath(import.meta.url));

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
    async loadClassFromFile(path: string): Promise<any> {
        if (path == null) return null
        const { path: loc, className } = this.getAlias(path)
        let classes = null
        const fileUrl = pathToFileURL(loc).href;

        if (fileUrl.endsWith(".js") || fileUrl.endsWith(".ts")) {
            const clazz = await import(fileUrl)
            return clazz.default ?? clazz
        } else {
            try {
                classes = await import(`${fileUrl}\\index.js`)
            } catch (e) {
                try {
                    classes = await import(fileUrl)
                } catch (e) {
                    try {
                        classes = await import(`${fileUrl}\\index`)
                    } catch (e) {
                        console.error(e)
                        return null
                    }
                }
            }
        }
        if (!classes) {
            console.error("classe non trovata")
            return null
        }

        // se è definito un "className" prendo la class con quel "className"
        if (className) {
            const clazz = classes[className]
            return clazz.default ?? clazz
        }

        // ... altrimenti prendo la prima della lista (iniziando per defualt se c'e')
        return Object.keys(classes)
            .sort(k => k == "default" ? -1 : 1)
            .map(k => classes[k])[0]
    }

    /**
     * Restituisce la path assoluta e il nome della classe da caricare
     */
    private getAlias(path: string): { path: string, className?: string } {
        const index = path.indexOf("/")
        const [alias, name] = index == -1
            ? ["", path]
            : [index == 0 ? "/" : path.slice(0, index), path.slice(index + 1)]

        if ([".", "..", "/", "@"].indexOf(alias) != -1) {
            return { path }
        }
        return {
            path: p.join(__dirname, "..", alias == "" ? path : alias),
            className: alias == "" ? undefined : name
        }
    }

    /**
     * restituisce un array di path-string dei files contenuti dentro una directory
     * @param dir la path dove andare a prendere i file
     * @param ext filtra i file in base all'estensione. Se null prende tutti i file.
     * Per esempio: ".html"
     */
    // private static async GetFiles ( dir:string, ext?:string ): Promise<string[]> {
    //     return new Promise<string[]>( (res,rej) => {
    //         fs.readdir ( 
    //             dir,
    //             (err,files)=> {
    //                 res(files
    //                     .filter ( file => ext==null || path.extname(file) == ext )
    //                     .map ( file => path.join(dir,file) )
    //                 );
    //             }
    //         );
    //     });
    // }

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