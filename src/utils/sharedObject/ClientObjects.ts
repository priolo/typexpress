import { ApplyAction } from "./applicators/ArrayApplicator"
import { Action, ApplyActionFunction, ClientInitMessage, ClientObject, ClientUpdateMessage, ServerInitMessage, ServerUpdateMessage } from "./types"



export class ClientObjects {

	apply: ApplyActionFunction = ApplyAction
	onSend: (message: ClientInitMessage | ClientUpdateMessage) => Promise<void> = null

	objects: { [idObj: string]: ClientObject } = {}
	private observers: { [idObj: string]: ((data: any) => void)[] } = {}
	private initResolve: ((value: void | PromiseLike<void>) => void) | null = null


	//#region OBSERVERS

	observe(idObj: string, callback: (data: any) => void) {
		if (!this.observers[idObj]) this.observers[idObj] = []
		this.observers[idObj].push(callback)
	}
	unobserve(idObj: string, callback: (data: any) => void) {
		if (!this.observers[idObj]) return
		this.observers[idObj] = this.observers[idObj].filter(obs => obs != callback)
	}
	private notify(idObj: string, data: any) {
		this.observers[idObj]?.forEach(obs => obs(data))
	}

	//#endregion

	/** chiede al server di restituire/creare un certo oggetto */
	init(idObj: string): Promise<void> {
		const message: ClientInitMessage = {
			type: "c:init",
			payload: { idObj }
		}
		return new Promise<void>(resolve => {
			this.initResolve = resolve
			this.onSend?.(message)
		})
	}

	/** invia un comando di aggiornamento al server */
	command(idObj: string, command: any) {
		const data = this.objects[idObj]
		if (!data) throw new Error("Object not found")
		const message: ClientUpdateMessage = {
			type: "c:update",
			payload: {
				idObj: idObj,
				atVersion: data.version,
				command: command,
			},
		}
		this.onSend(message)
	}

	/** stringa messaggio da analizzare */
	receive(messageStr: string) {
		const message = JSON.parse(messageStr)
		switch (message.type) {
			case "s:init": {
				const msgInit = message as ServerInitMessage
				this.setObject(msgInit.idObj, msgInit.data, msgInit.version)
				if (this.initResolve) {
					this.initResolve()
					this.initResolve = null
				}
				break
			}
			case "s:update": {
				const msgUp = message as ServerUpdateMessage
				this.updateObject(msgUp.idObj, msgUp.actions)
				break
			}
		}
	}

	private setObject(idObj: string, value: any[], version: number) {
		this.objects[idObj] = { idObj, value, version }
		this.notify(idObj, value)
	}

	private updateObject(idObj: string, action: Action[]) {
		const obj = this.objects[idObj]
		action.forEach(act => {
			obj.value = this.apply(obj.value, act)
		})
		obj.version = action[action.length - 1].version
		this.notify(idObj, obj.value)
	}
}