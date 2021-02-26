import { ServiceBase } from "core/ServiceBase"
import { EventEmitter } from "events"
import { INode } from "../../core/node/INode"
import { Node } from "../../core/node/Node"
import { NodeConf } from "../../core/node/NodeConf"
import { EmitterActions } from "./EmitterActions"



/**
 * Il SEVICE che si occupa di caricare l'array di classi presenti in un file js
 */
export class EmitterService extends ServiceBase {

    protected emitter:EventEmitter = new EventEmitter()

    get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[EmitterActions.REGISTER]: async (state, query) => {
				const repo = this.getRepo()
				return await repo.find(query)
			},
			[RepoRestActions.SAVE]: async (state, entity) => {
				const repo = this.getRepo()
				return await repo.save(entity);
			},
			[RepoRestActions.ALL]: async (state) => {
				const repo = this.getRepo()
				return await repo.find();
			},
			[RepoRestActions.GET_BY_ID]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.findOne(id) ?? null;
			},
			[RepoRestActions.DELETE]: async (state, id) => {
				const repo = this.getRepo()
				return await repo.delete(id);
			}
		}
	}

}