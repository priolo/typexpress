import fs from "fs"
import path from "path"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder";
import { TypeormRepoService } from "../TypeormRepoService";
import { RepoStructActions } from "../../../core/repo/utils";
import { TypeormActions } from "../utils";
import { Bus } from "../../../core/path/Bus";
import { EntitySchemaOptions } from "typeorm/entity-schema/EntitySchemaOptions";


import { Raw, Between, Column, Entity, PrimaryGeneratedColumn } from "typeorm"




const dbPath = path.join(__dirname, "/database.sqlite")
let root: RootService = null


beforeAll(async () => {
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }

	root = await RootService.Start({
		class: "typeorm",
		options: {
			type: "sqlite",
			database: dbPath,
			synchronize: true,
		},
		children: [
			{
				name: "messages",
				class: "typeorm/repo",
				findOptions: { relations: ["Files"] },
				model: <EntitySchemaOptions<any>>{
					name: "Messages",
					columns: {
						uuid: { type: 'varchar', primary: true, generated: 'uuid' },
						text: { type: String, default: "" },
						x: { type: Number, nullable: true },
						y: { type: Number, nullable: true },
					},
					// https://typeorm.io/#/separating-entity-definition
					// https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html
					relations: {
						documents: {
							type: "one-to-many",
							target: "Files",
							cascade: true,
							inverseSide: 'target',
							//createForeignKeyConstraints: false,	
							//onDelete: "CASCADE",
						}

					}
				},
			},
			{
				name: "files",
				class: "typeorm/repo",
				model: {
					name: "Files",
					columns: {
						uuid: { type: 'varchar', primary: true, generated: 'uuid' },
						path: { type: String, default: "" },
					},
					// https://typeorm.io/#/separating-entity-definition
					// https://typeorm.delightful.studio/interfaces/_entity_schema_entityschemarelationoptions_.entityschemarelationoptions.html
					relations: {
						target: {
							type: "many-to-one",
							target: "Messages",
							//createForeignKeyConstraints: false,	
							//cascade: true,
							//inverseSide: 'documents',
							//joinColumn: 'authorId',
							onDelete: "CASCADE",
						}
					}
				}
			}
		]
	})

	await new Bus(root, "/typeorm/messages").dispatch({
		type: RepoStructActions.SEED,
		payload: [
			{ text: "message 1", x: 1, y: 2 },
			{ text: "message 2", x: 5, y: 7 },
			{ text: "message 3", x: 100, y: 67 },
			{ text: "message 4", x: 154, y: 89 },
			{ text: "message 5", x: 956, y: 625 },
			{ text: "message 6", x: 865, y: 774 },
		]
	})

})

afterAll(async () => {
	await RootService.Stop(root)
	//try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("Find item with WHERE", async () => {
	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/messages")

	let results

	results = await rep.dispatch({
		type: TypeormActions.FIND,
		payload: { where: { text: "message 3" } }
	})
	expect(results[0]).toMatchObject({ x: 100, y: 67 })

	results = await rep.dispatch({
		type: TypeormActions.FIND,
		payload: { where: { 
			x: { type: "raw", sql:`{*} BETWEEN 0 AND 10` }, 
			y: { type: "between", from: 0, to: 10 },
		}}
	})
	expect(results).toMatchObject([
		{ text: "message 1", x: 1, y: 2 },
		{ text: "message 2", x: 5, y: 7 },
	])


	// results = await rep.dispatch({
	// 	type: TypeormActions.FIND,
	// 	payload: { where: { x: Between(0, 10), y: Between(0, 10) } }
	// })

	// results = await rep.dispatch({
	// 	type: TypeormActions.FIND,
	// 	payload: { where: { x: Raw(alias=>`${alias} BETWEEN 0 AND 10`), y: Raw(alias=>`${alias} BETWEEN 0 AND 10`) } }
	// })

	// rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/doc")
	// let docs = await rep.dispatch({ type: RepoRestActions.ALL })
	// expect(docs.length).toBe(1)

	debugger




})
