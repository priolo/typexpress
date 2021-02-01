const nodeRoot = {
	id: "1",
	name: "item root",
	children: [
		{
			id: "2",
			name: "item 1",
			children: [
				{ id: "3", name: "item 1.1" },
				{ id: "4", name: "item 1.2" },
			],
		},
		{
			id: "5",
			name: "item 2",
			children: [
				{ id: "6", name: "item 2.1" },
				{
					id: "7",
					name: "item 2.2",
					children: [
						{ id: "8", name: "item 2.2.1" },
						{ id: "9", name: "item 2.2.2" },
					],
				},
			]
		},
	],
}

function navigator ( nodes, callback ) {
 if ( nodes==null ) return
 if ( !Array.isArray(nodes)) nodes=[nodes]
  for ( const node of nodes ) {
    callback(node)
    navigator(node.children,callback)
  }
}


navigator ( nodeRoot, (node)=>console.log(node.name) )