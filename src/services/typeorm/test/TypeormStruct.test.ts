import fs from "fs"
import path from "path"
import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder";
import { TypeormRepoService } from "../TypeormRepoService";
import { ConfActions } from "../../../core/node/NodeConf";
import { RepoRestActions } from "../../../core/repo/RepoRestActions";
import { RepoStructActions } from "../../../core/repo/RepoStructActions";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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
					"type": "sqlite",
					"database": dbPath,
					"synchronize": true,
					entities: [Item]
				},
				children: [
					{
						name: "user", class: "typeorm/repo",
						model: {
							name: "User",
							columns: {
								id: { type: Number, primary: true, generated: true },
								firstName: { type: String, default: "" },
								lastName: { type: String, default: "" },
								age: { type: Number, default: 18 },
							}
						},
					},
					{
						name: "item", class: "typeorm/repo", model: "Item",
						seeds: [
							{ type: RepoStructActions.TRUNCATE },
							{ label: "primo" },
							{ label: "secondo" },
							{ label: "terzo" },
							{ label: "quarto" },
							{ label: "quinto" },
							{ label: "sesto" },
						]
					},
				]
			}
		]
	)
})

afterAll(async () => {
	if (root) await root.dispatch({ type: ConfActions.STOP })
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("Check seed create", async () => {

	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/user")
	await rep.dispatch({
		type: RepoStructActions.SEED, payload: [
			`INSERT INTO User (firstName, lastName, age) VALUES ("Ivano", "Iorio", 45);`,
			{ firstName: "Marina", lastName: "Bossi", age: 32 }
		]
	})

	// preleva tutti gli USER
	let users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users).toEqual([
		{ id: 1, firstName: 'Ivano', lastName: 'Iorio', age: 45 },
		{ id: 2, firstName: 'Marina', lastName: 'Bossi', age: 32 }
	])

	await rep.dispatch({
		type: RepoStructActions.SEED, payload: [
			{ type: RepoStructActions.TRUNCATE },
		]
	})

	users = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(users.length).toEqual(0)
})

test("Check seed config", async () => {
	const rep = new PathFinder(root).getNode<TypeormRepoService>("/typeorm/item")
	let items = await rep.dispatch({ type: RepoRestActions.ALL })
	expect(items[0].label).toBe("primo")
	expect(items[1].label).toBe("secondo")
	expect(items[5].label).toBe("sesto")
})