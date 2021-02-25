import { ServiceBase } from "../../core/ServiceBase";
import { PathFinder } from "../../core/path/PathFinder";
import express, { Router } from "express";
import { IHttpRouter } from "../http/IHttpRouter";

/**
 * Si attacca al PARENT (deve implementare IHttpRouter) come ROUTER
 */
export abstract class HttpRouterServiceBase extends ServiceBase implements IHttpRouter {

	private router: Router = null

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			path: "/",
			cors: {},
		}
	}

	protected async onInit(): Promise<void> {
		await super.onInit()
		const parent = new PathFinder(this).getNode<IHttpRouter>("..")
		this.router = this.onBuildRouter()
		parent.use(this.router, this.state.path)
	}

	protected async onDestroy(): Promise<void> {
		await super.onDestroy()
		this.router = null
	}

	protected abstract onBuildRouter(): Router

	use(router: Router, path:string="/"): void {
		this.router.use(path, router)
	}

}
