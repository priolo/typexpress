import { ServiceBase } from "../../core/service/ServiceBase"
import { Actions } from "./utils"
import { log, LOG_TYPE } from "@priolo/jon-utils";
import { INode } from "core/node/utils";


/**
 * 
 */
export default class LogService extends ServiceBase {

	static Send(node:INode, log:string) {
		new Bus(node, "/log").dispatch({ 
			type: Actions.LOG, 
			payload: log
		})
	}

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "log",
			onLog: null,
		}
	}

	get dispatchMap(): any {
		return {
			...super.dispatchMap,
			[Actions.LOG]: async (state: any, log: string, sender: string) => {
				this.onLog(sender, log)
			},
		}
	}

	protected onLog(sender: string, logMessage: string): void {
		const { onLog } = this.state
		log(`${sender}::${logMessage}`, LOG_TYPE.ERROR)
		onLog?.bind(this)(logMessage)
	}

}
