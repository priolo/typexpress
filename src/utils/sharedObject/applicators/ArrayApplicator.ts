import { Action } from "../types";



export function ApplyAction(data?: any[], action?: Action): any[] {
	if (!data) return []
	
	switch (action.command) {
		case "remove": {
			data.pop()
			break
		}
		case "add": {
			data.push(`add row version ${action.version}`)
			break
		}
	}
	return data
}