import { RootService, utils } from "../../index"

test("su creazione", async () => {
	const root = await RootService.Start([{
		name: "node.1",
		// valore inserito nello STATE di questo NODE
		value: "1",
		children: [
			// anche qui inserisco "val_text" e "val_number" nei rispettivi NODEs
			{ name: "node.1.1", val_text: "1.1" },
			{ name: "node.1.2", val_number: 1.2 }
		]
	}])

	const rootJson = utils.nodeToJson(root)
	expect(rootJson).toMatchObject({
		name: "root",
		children: [
			{ name: "farm" },
			{ name: "error" },
			{
				name: "node.1",
				value: "1",
				children: [
					{ name: "node.1.1", val_text: "1.1" },
					{ name: "node.1.2", val_number: 1.2 },
				],
			},
		],
	})
})