import fs from "fs"
import path from "path"
import { RootService } from "../../../core/RootService"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PathFinder } from "../../../core/path/PathFinder";
import { TypeormRepoService } from "../TypeormRepoService";
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/repo/RepoRestActions";
import { RepoStructActions } from "../../../core/repo/RepoStructActions";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column()
	age: number;
}

const dbPath = path.join(__dirname, "/database.sqlite")
let root: RootService = null

beforeAll(async () => {
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } 
	catch (e) { console.log(e) }
	
	root = new RootService()
	await root.dispatch({
		type: ConfActions.START,
		payload: {
			children: [
				{
					class: "typeorm",
					options: {
						"type": "sqlite",
						"database": dbPath,
						"synchronize": true,
						"entities": [User]
					},
					schemas: [
						{
							name: "Account",
							columns: {
								id: { type: Number, primary: true, generated: true },
								username: { type: String }
							}
						}
					],
					children: [
						{
							name: "user", class: "typeorm/repo",
							model: "User",
						},
						{
							name: "account", class: "typeorm/repo",
							model: "Account",
						},
						{
							name: "item", class: "typeorm/repo",
							model: {
								name: "Item",
								columns: {
									id: { type: Number, primary: true, generated: true },
									name: { type: String }
								}
							},
						},
					]
				}
			]
		}
	})
})
afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("Check seed create", async () => {

	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/user")
	await rep.dispatch({type:RepoStructActions.SEED, payload: [
		`INSERT INTO User (firstName, lastName, age) VALUES ("Ivano", "Iorio", 45);`,
		{firstName: "Marina", lastName: "Bossi", age: 32 }
	]})

	// preleva tutti gli USER
	let users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users).toEqual([
		{ id: 1, firstName: 'Ivano', lastName: 'Iorio', age: 45 },
		{ id: 2, firstName: 'Marina', lastName: 'Bossi', age: 32 }
	])

	await rep.dispatch({type:RepoStructActions.SEED, payload: [
		{ type: RepoStructActions.TRUNCATE },
	]})

	users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users.length).toEqual(0)
})

