import WebSocket from "ws"
import { PathFinder } from "../../../core/path/PathFinder"
import { RootService } from "../../../core/RootService"
import * as wsNs from "../index"
import { SocketServerConf } from "../SocketServerService"
import { getFreePort, SocketRouteActions } from "../utils"



let PORT: number = 52
let root: RootService

beforeAll(async () => {
	PORT = await getFreePort()
	root = await RootService.Start(
		<SocketServerConf>{
			class: "ws",
			port: PORT,
			onMessage: async function (client, messageStr: string) {
				const message = JSON.parse(messageStr)
				switch (message.type) {

					case "c:init": {
						const msgInit = message as ClientInitMessage
						let data = sharedServer[msgInit.payload.idObj]
						let listener: Listener
						if (!data) {
							listener = { client, lastVersion: 0 }
							data = {
								idObj: msgInit.payload.idObj,
								value: [],
								listeners: [listener],
								actions: []
							}
							sharedServer[msgInit.payload.idObj] = data
						} else {
							listener = {
								client,
								lastVersion: data.actions[data.actions.length - 1].version
							}
							data.listeners.push(listener)
						}

						// invio lo stato iniziale
						const msg: ServerInitMessage = {
							type: "s:init",
							idObj: data.idObj,
							data: data.value,
							version: listener.lastVersion
						}
						await this.dispatch({
							type: SocketRouteActions.SEND,
							payload: { client, message: JSON.stringify(msg) }
						})

						break
					}


					case "c:update": {
						const msgUp = message as ClientUpdateMessage
						const objShared = sharedServer[msgUp.payload.idObj]
						if (!objShared) return
						const action:Action = {
							action: msgUp.payload.action,
							atVersion: msgUp.payload.atVersion,
							version: objShared.actions.length
						}
						objShared.actions.push(action)
						ApplyAction(objShared.value, action)
						break
					}

				}
			},
		}
	)


	const wss: wsNs.Service = new PathFinder(root).getNode<wsNs.Service>("/ws-server")

	// invia gli aggiornamenti ai client
	await new Promise(resolve => setTimeout(resolve, 1000));

	for (const idObj in sharedServer) {
		const data = sharedServer[idObj]
		const lastVersion = data.actions[data.actions.length - 1]?.version ?? 0
		data.listeners.forEach(async listener => {
			if ( listener.lastVersion == lastVersion ) return
			const actions = data.actions.filter(action => action.version > listener.lastVersion)
			const msg:ServerUpdateMessage = {
				type: "s:update",
				idObj: data.idObj,
				actions,
				version: lastVersion
			}
			wss.dispatch({
				type: SocketRouteActions.SEND,
				payload: { client: listener.client, message: JSON.stringify(msg) }
			})
			listener.lastVersion = lastVersion
		})
	}

})

afterAll(async () => {
	await RootService.Stop(root)
})


test("su creazione", async () => {
	const wss = new PathFinder(root).getNode<wsNs.Service>("/ws-server")
	expect(wss).toBeInstanceOf(wsNs.Service)
})

test("client connetc/send/close", async () => {

	const ws = new WebSocket(`ws://localhost:${PORT}/`);

	// dopo INIT mando subito un update
	function onInit() {
		const data = sharedClient["test"/*msgInit.idObj*/]
		ws.send(<ClientUpdateMessage>{
			type: "c:update",
			payload: {
				idObj: "test",
				atVersion: data.version,
				action: "remove 1",
			},
		})
	}

	const result = await new Promise<string>((res, rej) => {

		ws.on('open', function open() {
			ws.send(<ClientInitMessage>{
				type: "c:init",
				payload: { idObj: "test" },
			})
		});

		ws.on('message', (wsData: any) => {
			const message = JSON.parse(wsData);
			const type = message.type
			switch (type) {

				case "s:init": {
					const msgInit = message as ServerInitMessage
					sharedClient[msgInit.idObj] = {
						idObj: msgInit.idObj,
						value: msgInit.data,
						version: msgInit.version
					}
					onInit()
					break
				}

				case "s:update": {
					const msgUp = message as ServerUpdateMessage
					const data = sharedClient[msgUp.idObj]
					msgUp.actions.forEach(action => {
						ApplyAction(data.value, action)
					})
					data.version = msgUp.version
					break
				}

			}

		});
		ws.on('close', function close() {
			res("ok")
		});
	})

	expect(result).toBe("ok")

})


// *** SERVER ***
interface ServerShared {
	[idObj: string]: ServerObject
}

interface ServerObject {
	idObj: string
	value: any[]
	listeners: Listener[]
	actions: Action[]
}

interface Listener {
	client: wsNs.IClient
	lastVersion: number
}

interface Action {
	action: string
	atVersion: number
	version: number
}

// MESSAGES
interface ServerInitMessage {
	type: "s:init"
	idObj: string
	data: any[]
	version: number
}

interface ServerUpdateMessage {
	type: "s:update"
	idObj: string
	actions: Action[]
	version: number
}


// *** CLIENT ******************************************

// DATA
interface ClientShared {
	[idObj: string]: ClientObject
}
interface ClientObject {
	idObj: string
	value: any[]
	version: number
}

// MESSAGES
interface ClientInitMessage {
	type: "c:init"
	payload: {
		idObj: string
	}
}

interface ClientUpdateMessage {
	type: "c:update"
	payload: {
		idObj: string, // id dell'Obj
		atVersion: number,
		action: any,
	}
}



const sharedServer: ServerShared = {}
const sharedClient: ClientShared = {}






function ApplyAction(data: any[], action: Action) {
	switch (action.action) {
		case "remove": {
			data.pop()
			break
		}
		case "add 1": {
			data.push(action)
			break
		}
	}
}