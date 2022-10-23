import { createConnection, DataSource, EntitySchema } from "typeorm";
import path from "path"
import { ServiceBase } from "../../core/service/ServiceBase";
import { TypeormRepoService } from "./TypeormRepoService";
import { Bus } from "../../core/path/Bus";
import * as errorNs from "../error";
import { TypeormRepoBaseService } from "./TypeormRepoBaseService";

// import { TypeormRestService } from "./TypeormRestService";
// import { ConfActions } from "../../core/node/NodeConf";

/**
 * Crea e utilizza un DataSource Typeorm. 
 * E' il "node" padre di tutti i repo
 */
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

	public get connection(): DataSource | null {
		return this._connection
	};
	private _connection: DataSource | null = null

	/**
	 * Dopo aver creato tutti i "children" li raccolgo per creare i "repo" in typeorm e connettermi al db
	 */
	protected async onInitAfter(): Promise<void> {
		let { options, schemas } = this.state

		if (!options) new Bus(this, "/error").dispatch({ 
			type: errorNs.Actions.NOTIFY, 
			payload: "typeorm:options:obbligatory" 
		})

		// // raccolgo tutti i children che derivano da typeorm-repo e che hanno un "model" cioe' una schema definition
		// const childRepo = this.children
		// 	.filter(c => c instanceof TypeormRepoBaseService && c?.state?.model && typeof c.state.model == "object")

		// raccolgo tutti gli SCHEMA presenti in STATE e nei CHILDREN
		schemas = [
			...schemas ?? [],
			...this.children
				.filter(c => c instanceof TypeormRepoBaseService && c?.state?.model && typeof c.state.model == "object")
				.map(c => (<TypeormRepoService>c).state.model)
		]

		// creo gli oggetti EntitySchema che dovro' passare a typeorm
		if (schemas.length > 0) {
			options.entities = [
				...options.entities ?? [],
				...schemas.map(s => new EntitySchema(s))
			]
		}

		// creo la connessione
		this.setState({ options })

		try {
			const ds = new DataSource(options)
			this._connection = await ds.initialize()
		} catch (e) {
			new Bus(this, "/error").dispatch({ 
				type: errorNs.Actions.NOTIFY, 
				payload: e 
			})
		}

		await super.onInitAfter()
	}

	/**
	 * Quando il nodo viene distrutto chiudo la connesione
	 */
	protected async onDestroy(): Promise<void> {
		await this._connection?.close()
		this._connection = null
	}

}