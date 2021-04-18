import fs from "fs"
import path from "path"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder";
import { TypeormRepoService } from "../TypeormRepoService";
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/repo/RepoRestActions";
import { RepoStructActions } from "../../../core/repo/RepoStructActions";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { TypeormActions } from "../TypeormRepoBaseService";


const dbPath = path.join(__dirname, "/database.sqlite")
let root: RootService = null

@Entity()
export class Item {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	label: string;
}





beforeAll(async () => {
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) }
	catch (e) { console.log(e) }

	root = await RootService.Start(
		[
			{
				class: "typeorm",
				options: {
					type: "sqlite",
					database: dbPath,
					synchronize: true,
					entities: [Item]
				},
				children: [
					{
						name: "user", 
						class: "typeorm/repo",
						findOptions: { relations: ["documents"] },
						model: {
							name: "User",
							columns: {
								id: { type: Number, primary: true, generated: true },
								firstName: { type: String, default: "" },
								lastName: { type: String, default: "" },
								age: { type: Number, default: 18 },
							},
							// https://typeorm.io/#/separating-entity-definition
							relations: {
								documents: {
									type: "one-to-many",
									target: "Doc",
									cascade: true,
									inverseSide: 'author',
									//createForeignKeyConstraints: false,	
									//onDelete: "CASCADE",
								}

							}
						},
					},
					{
						name: "doc", class: "typeorm/repo",
						model: {
							name: "Doc",
							columns: {
								id: { type: Number, primary: true, generated: true },
								text: { type: String, default: "" },
							},
							relations: {
								author: {
									type: "many-to-one",
									target: "User",

									//createForeignKeyConstraints: false,	
									//cascade: true,
									//inverseSide: 'documents',
									//joinColumn: 'authorId',
									onDelete: "CASCADE",
								}
							}
						}
					},
					{
						name: "item", class: "typeorm/repo", model: "Item",
						seeds: [
							{ type: RepoStructActions.TRUNCATE },
							{ label: "primo" }, { label: "secondo" }, { label: "terzo" }, { label: "quarto" }, { label: "quinto" }, { label: "sesto" },
						]
					},
				]
			}
		]
	)
})

afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
	//try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("Check seed create", async () => {

	// creo gli user con un SEED
	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/user")
	await rep.dispatch({
		type: RepoStructActions.SEED,
		payload: [
			`INSERT INTO User (firstName, lastName, age) VALUES ("Ivano", "Iorio", 45);`,
			{
				firstName: "Marina", lastName: "Bossi", age: 32, documents: [
					{ text: "doc1" },
					{ text: "doc2" },
					{ text: "doc3" },
				]
			}
		]
	})

	// CONTROLLO GLI USER
	let users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users).toMatchObject([
		{ firstName: 'Ivano', lastName: 'Iorio', age: 45 },
		{
			firstName: 'Marina', lastName: 'Bossi', age: 32, documents: [
				{ text: "doc1" },
				{ text: "doc2" },
				{ text: "doc3" },
			]
		}
	])

	// ELIMINO GLI USER CON UN SEED
	await rep.dispatch({
		type: RepoStructActions.SEED, payload: [
			{ type: RepoStructActions.CLEAR },
		]
	})

	// CONTROLLO CHE NON CI SIANO PIU'
	users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users.length).toEqual(0)
})

test("Check seed config", async () => {

	// ESEGUO UN SEED DA CONFIG
	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/item")
	let items = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(items[0].label).toBe("primo")
	expect(items[1].label).toBe("secondo")
	expect(items[5].label).toBe("sesto")
})

test("Check delete cascade", async () => {
	// creo gli user con un SEED
	let rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/user")
	await rep.dispatch({
		type: RepoStructActions.SEED,
		payload: [
			{
				firstName: "Marina", lastName: "Bossi", age: 32, documents: [
					{ text: "doc1" },
					{ text: "doc2" },
					{ text: "doc3" },
				]
			},
			{
				firstName: "Ivano", lastName: "Iorio", age: 45, documents: [
					{ text: "doc4" },
				]
			},
		]
	})

	let users = await rep.dispatch({ type: TypeormActions.FIND, payload: { where: { firstName: "Marina" }} })
	await rep.dispatch({ type: RepoRestActions.DELETE, payload: users[0].id})

	users = await rep.dispatch({ type: TypeormActions.FIND, payload: { where: { firstName: "Marina" }} })
	expect(users.length).toBe(0)

	rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/doc")
	let docs = await rep.dispatch({ type: RepoRestActions.ALL})
	expect(docs.length).toBe(1)
})
