import { PathFinder } from "../../../core/path/PathFinder";
import { nodeMap, nodeToJson } from "../../../core/utils";
import { Request, Response } from "express";
import { HttpRouterService } from "../../http-router/HttpRouterService";
import { NodeState } from "core/node/NodeState";


export class NodeRouteRest extends HttpRouterService {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			// name: "node",
			// path: "/node",
			routers: [
				{ verb: "get", path: "/", method: "index" },
				{ verb: "get", path: "/:id", method: "getById" },
				{ verb: "post", path: "/:id/:action", method: "action" },
				
			]
		}
	}

	index(req: Request, res: Response) {
		const root = new PathFinder(this).path("/").node
		const json = nodeMap(root, (n, children) => ({
			id: n.id,
			name: n.name,
			children: children(),
		}))
		res.json(json)
	}

	getById(req: Request, res: Response) {
		const { id } = req.params
		const node = new PathFinder(this).getNode<any>(`/>*${id}`)
		if ( !node ) return res.sendStatus(404)

		// const root = new PathFinder(this).getNode<any>(`/`)
		// const json = nodeToJson(root)
		// console.log(json)

		res.json(node ? {
			name: node.name,
			id: node.id,
			state: node.state,
		} : {})
	}

	async action(req: Request, res: Response) {
		const { id, type } = req.params
		const { payload } = req.body
		const node = new PathFinder(this).getNode<NodeState>(`/>*${id}`)
		if ( !node ) return res.sendStatus(404)

		const result = await node.dispatch ( {type, payload })
		res.json ( result )
	}

}