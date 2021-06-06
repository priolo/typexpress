import WebSocket from "ws"



export async function wait(time) {
	await new Promise<void>((res) => setTimeout(_ => res(), time))
}

export function distancePoints(p1, p2) {
	if (!p1.x || !p1.y || !p2.x || !p2.y) throw new Error("invalid parameter")
	const res = Math.sqrt(Math.pow(p1.x - p2.x, 2) + (Math.pow(p1.y - p2.y, 2)))
	if (isNaN(res)) throw new Error("invalid parameter")
	return res
}

export function getRandom(min, max) {
	return Math.round(Math.random() * (max - min) + min)
}

export async function wsFarm(address: (()=>string) | string , length: number, onConnection?: (client:WebSocket, index?: number) => void): Promise<WebSocket[]> {
	let resolver = null
	const promise = new Promise<WebSocket[]>(res => resolver = res)
	let count = 0
	const clients = Array.from<any, WebSocket>({ length }, (_, index) => {
		const strAddress = (typeof address=="function")? address() : address
		const ws = new WebSocket(strAddress)
		ws.once('open', () => {
			onConnection?.(ws, index)
			count++
			if (count == length) resolver(clients)
		})
		return ws
	})
	return promise
}