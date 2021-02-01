import { Router } from "express";

export interface IHttpRouter {
	use ( router:Router, path?:string )
}