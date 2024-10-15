import { ApplyAction } from "./applicators/ArrayApplicator"
import { MemServerComunication } from "./comunicators/MemServerComunication"
import { Action, ApplyActionFunction, Listener, ServerObject, ServerUpdateMessage } from "./types"



export class ServerObjects {
	constructor() {
		this.objects = {}
	}

	apply: ApplyActionFunction = ApplyAction
	objects: { [idObj: string]: ServerObject }



	/** recupera/crea un OBJ (assegno il listener "client") */
	getObject(idObj: string, client: any): ServerObject {
		let data = this.objects[idObj]
		let listener: Listener

		if (!data) {
			listener = { client, lastVersion: 0 }
			data = {
				idObj: idObj,
				value: [],
				listeners: [listener],
				actions: []
			}
			this.objects[idObj] = data

		} else if (!data.listeners.some(l => l.client == client)) {
			listener = {
				client,
				lastVersion: data.actions[data.actions.length - 1]?.version ?? 0
			}
			data.listeners.push(listener)
		}

		return data
	}

	/** creo internamente l'ACTION e aggiorno l'OBJ */
	updateFromAction(idObj: string, command: any, atVersion: number) {
		const objShared = this.objects[idObj]
		if (!objShared) return
		const act: Action = {
			command,
			atVersion,
			version: objShared.actions.length + 1
		}
		objShared.actions.push(act)
		objShared.value = this.apply(objShared.value, act)
	}

	updateToClient(comunicator: MemServerComunication) {
		for (const idObj in this.objects) {
			const data = this.objects[idObj]
			const lastVersion = data.actions[data.actions.length - 1]?.version ?? 0
			data.listeners.forEach(async listener => {
				/** il client è gi' aggiornato all'ultima versione */
				if (listener.lastVersion == -1 || listener.lastVersion == lastVersion) return
				/** tutti gli actions da inviare al listener */
				const actions = data.actions.filter(action => action.version > listener.lastVersion)
				const msg: ServerUpdateMessage = {
					type: "s:update",
					idObj: data.idObj,
					actions,
					version: lastVersion
				}
				this.sendToListener(msg, listener, lastVersion, comunicator)
			})
		}
	}

	private async sendToListener(msg: ServerUpdateMessage, listener: Listener, lastVersion: number, comunicator: MemServerComunication) {
		let oldVersion = listener.lastVersion
		try {
			listener.lastVersion = -1
			await comunicator.send(listener.client, msg)
			listener.lastVersion = lastVersion
		} catch (error) {
			console.error(error)
			listener.lastVersion = oldVersion
		}
	}
}