import { createConnection, Connection, EntitySchema } from "typeorm";
import path from "path"
import { ServiceBase } from "../../core/ServiceBase";
import { TypeormRepoService } from "./TypeormRepoService";
import { Bus } from "../../core/path/Bus";
import { ErrorServiceActions } from "../error/ErrorService";
// import { TypeormRestService } from "./TypeormRestService";
// import { ConfActions } from "../../core/node/NodeConf";


export class TypeormService extends ServiceBase {

	get defaultConfig(): any {
		return {
			...super.defaultConfig,
			name: "typeorm",
			// [II] sostituire con "options"
			// https://typeorm.io/#/connection-options
			options: {
				"type": "sqlite",
				//"username": null,
				//"password": null,
				"database": path.join(__dirname, "../database/database.sqlite"),
				"synchronize": true,
				"logging": true,
				"entities": [], // array-schema-entity-directory:mandatory:ex:[path.join(__dirname, "./models/**/*.js")]
				"schemas": [],	// array-schema
				// "migrations": [
				// 	"./database/migration/**/*.js"
				// ],
				// "subscribers": [
				// 	"../../subscriber/**/*.js"
				// ],
				// "cli": {
				// 	"entitiesDir": "app/models",
				// 	"migrationsDir": "database/migration",
				// 	"subscribersDir": "app/subscriber"
				// }
			}
		}
	}

	public get connection(): Connection | null {
		return this._connection
	};
	private _connection: Connection | null = null


	protected async onInitAfter(): Promise<void> {
		let { options, schemas } = this.state

		// raccolgo tutti gli SCHEMA presenti in STATE e nei CHILDREN
		schemas = [
			...schemas ?? [],
			...this.children
				.filter(c => c instanceof TypeormRepoService && c?.state?.model != null && typeof c.state.model == "object")
				.map(c => (<TypeormRepoService>c).state.model)
		]

		// screo gli oggetti EntitySchema che dovro' passare a typeorm
		if (schemas.length > 0) {
			options.entities = [
				...options.entities ?? [],
				...schemas.map(s => new EntitySchema(s))
			]
		}

		// creo la connessione
		this.setState({ options })

		try {
			this._connection = await createConnection(options)
		} catch (e) {
			new Bus(this, "/error").dispatch({ type: ErrorServiceActions.NOTIFY, payload: e })
		}

		await super.onInitAfter()
	}

	protected async onDestroy(): Promise<void> {
		await this._connection?.close()
		this._connection = null
	}

}