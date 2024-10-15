import { ApplyAction } from "./applicators/ArrayApplicator"
import { Action, ApplyActionFunction, ClientObject } from "./types"



export class ClientObjects {
	constructor() {
		this.objects = {}
		this.observers = {}
	}

	apply: ApplyActionFunction = ApplyAction
	objects: { [idObj: string]: ClientObject }
	private observers: { [idObj: string]: ((data: any) => void)[] }




	observe(idObj: string, callback: (data: any) => void) {
		if (!this.observers[idObj]) this.observers[idObj] = []
		this.observers[idObj].push(callback)
	}
	unobserve(idObj: string, callback: (data: any) => void) {
		if (!this.observers[idObj]) return
		this.observers[idObj] = this.observers[idObj].filter(obs => obs != callback)
	}
	notify(idObj: string, data: any) {
		this.observers[idObj]?.forEach(obs => {
			obs(data)
		})
	}



	setObject(idObj: string, value: any[], version: number) {
		this.objects[idObj] = {
			idObj,
			value,
			version,
		}
		this.notify(idObj, value)
	}

	updateObject(idObj: string, action: Action[]) {
		const obj = this.objects[idObj]
		action.forEach(act => {
			obj.value = this.apply(obj.value, act)
		})
		obj.version = action[action.length - 1].version
		this.notify(idObj, obj.value)
	}
}