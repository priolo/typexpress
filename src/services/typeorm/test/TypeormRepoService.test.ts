import fs from "fs"
import path from "path"
import { RootService } from "../../../core/RootService"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PathFinder } from "../../../core/path/PathFinder";
import { TypeormActions, TypeormRepoService } from "../TypeormRepoService";
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/repo/RepoRestActions";

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

test("USER", async () => {

	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/user")
	expect(rep instanceof TypeormRepoService).toBeTruthy()

	// crea due USER
	await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			firstName: "Ivano",
			lastName: "Iorio",
			age: 45,
		}
	})
	await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			firstName: "Marina",
			lastName: "Bossi",
			age: 32,
		}
	})

	// preleva uno specifico USER
	let user = await rep.dispatch({
		type: TypeormActions.FIND,
		payload: { where: { firstName: "Marina" } }
	})
	expect(user).toEqual([
		{ id: 2, firstName: 'Marina', lastName: 'Bossi', age: 32 }
	])

	// preleva tutti gli USER
	let users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users).toEqual([
		{ id: 1, firstName: 'Ivano', lastName: 'Iorio', age: 45 },
		{ id: 2, firstName: 'Marina', lastName: 'Bossi', age: 32 }
	])

	// modifica lo USER con id = 2
	await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: <User>{
			id: 2,
			firstName: "Marino",
		}
	})

	// preleva lo USER con id = 2
	user = await rep.dispatch({ type: RepoRestActions.GET_BY_ID, payload: 2 })
	expect(user).toEqual(
		{ id: 2, firstName: 'Marino', lastName: 'Bossi', age: 32 }
	)

	// elimina lo USER con id = 2
	await rep.dispatch({ type: RepoRestActions.DELETE, payload: 2 })
	users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users).toEqual([
		{ id: 1, firstName: 'Ivano', lastName: 'Iorio', age: 45 },
	])
})

test("ACCOUNT", async () => {

	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/account")
	expect(rep instanceof TypeormRepoService).toBeTruthy()

	// crea due ACCOUNT
	await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			username: "priolo",
		}
	})
	let account = await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			username: "huetotolin",
		}
	})

	// preleva uno specifico ACCOUNT
	let [account2] = await rep.dispatch({
		type: TypeormActions.FIND,
		payload: { where: { username: "huetotolin" } }
	})
	expect(account).toEqual(account2)
})

test("ITEMS", async () => {

	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/item")
	expect(rep instanceof TypeormRepoService).toBeTruthy()

	// crea due ITEM
	await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			name: "scarpa",
		}
	})
	let item = await rep.dispatch({
		type: RepoRestActions.SAVE,
		payload: {
			name: "barattolo",
		}
	})

	// preleva uno specifico ITEM
	let [item2] = await rep.dispatch({
		type: TypeormActions.FIND,
		payload: { where: { name: "barattolo" } }
	})
	expect(item).toEqual(item2)
})
