import { INode } from "../../core/node/INode"
import { Node } from "../../core/node/Node"
import { NodeConf } from "../../core/node/NodeConf"



/**
 * Il SEVICE che si occupa di caricare l'array di classi presenti in un file js
 */
export default class FarmService extends Node {

    name: string = "farm"

    /**
     * Carico una specifica classe
     * "<path>": è la classe di default che si trova nella cartella "services/<path>"
     * "<path>/<name>": è una classe che si trova nella cartella "services/<path>" esportata col nome "<name>"
     * "<alias>/<path>": va caricata a seconda dell'alias
     * @param path 
     */
    async loadClassFromFile(path: string): Promise<any> {
        if (path == null) return null
        const { path:loc, className } = this.getAlias(path)
        let classes = null
        try { 
            classes = await require(loc) 
        } catch (e) {
            console.error(e) 
            return null 
        }
        if ( !classes ) {
            console.error("classe non trovata") 
            return null
        }

        // se è definito un "className" prendo la class con quel "className"
        if ( className ) {
            const clazz = classes[className]
            return clazz.default ?? clazz
        }

        // ... altrimenti prendo la prima della lista (iniziando per defualt se c'e')
        return Object.keys(classes)
            .sort(k => k == "default" ? -1 : 1)
            .map(k => classes[k])[0]
    }

    private getAlias(path: string): { path: string, className?: string } {
        const index = path.indexOf("/")
        const [alias, name] = index == -1
            ? ["", path]
            : [index == 0 ? "/" : path.substring(0, index), path.substr(index + 1)]

        if ([".", "..", "/", "@"].indexOf(alias) != -1) {
            return { path }
        }
        return {
            path: `${__dirname}/../${alias == "" ? path : alias}`,
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