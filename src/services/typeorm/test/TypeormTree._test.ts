import fs from "fs"
import path from "path"
import { Column, Entity, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";

import { RootService } from "../../../core/RootService"
import { PathFinder } from "../../../core/path/PathFinder";
import { RepoStructActions, RepoTreeActions } from "../../../core/repo/utils";
import { Bus } from "../../../core/path/Bus";

import * as orm from "../index";
import { deleteIfExist } from "../../fs";



const dbPath = path.join(__dirname, "/database.sqlite")
let root: RootService = null

@Entity()
@Tree("nested-set")
export class Item {
	@PrimaryGeneratedColumn()
	id: number;

	@Column("varchar")
	label: string;

	@TreeChildren({cascade:true})
	children: Item[];

	@TreeParent()
	parent: Item;
}


beforeAll(async () => {
	
	await deleteIfExist(dbPath)

	root = await RootService.Start([
		{
			class: "typeorm",
			options: {
				"type": "sqlite",
				"database": dbPath,
				"synchronize": true,
				"entities": [Item]
			},
			children: [
				{
					name: "index", class: "typeorm/tree",
					model: "Item",
					// NON FUNZIONA
					// {
					// 	name: "Index",
					// 	columns: {
					// 		id: { type: Number, primary: true, generated: true },
					// 		label: { type: String, default: "" },
					// 	},
					// 	relations: {
					// 		parent: {
					// 			target: "Index",
					// 			type: "many-to-one",
					// 			treeParent: true
					// 		},
					// 		children: {
					// 			target: "Index",
					// 			inverseSide: "Index",
					// 			type: "one-to-many",
					// 			joinTable: true,
					// 			cascade: true,
					// 			treeChildren: true
					// 		}
					// 	}
					// },
					seeds: [
						{ type: RepoStructActions.TRUNCATE },
						{
							label: "item 1", 
							children: [
								{
									label: "item 1.1", 
									children: [
										{ label: "item 1.1.1" },
										{ label: "item 1.1.2" },
										{ label: "item 1.1.3" },
									]
								},
								{
									label: "item 1.2", 
									children: [
										{ label: "item 1.2.1" },
									]
								},
								{ label: "item 1.3" },
							]
						},
						{ label: "item 2" },
					]
				},
			],
		}
	])

	await new Bus(root, "/typeorm/index").dispatch({ type: RepoStructActions.SEED })
})

afterAll(async () => {
	await RootService.Stop(root)
	try { if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath) } catch (e) { console.log(e) }
})

test("Check seed tree", async () => {

	const rep = new PathFinder(root).getNode<orm.tree>("/typeorm/index")

	const roots = await rep.dispatch({ type: RepoTreeActions.GET_ROOTS})

	expect(roots[0].label).toEqual("item 1")

	const res = await rep.dispatch({ type: RepoTreeActions.GET_CHILDREN, payload: roots[0]})

	expect(res.children[1].children[0].label).toEqual("item 1.2.1")
})

