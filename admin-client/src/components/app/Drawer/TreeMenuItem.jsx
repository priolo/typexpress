import React from 'react';

import { fade, makeStyles } from '@material-ui/core/styles';
import TreeItem from '@material-ui/lab/TreeItem';


export default function TreeMenuItem({ node }) {
	if (!node || !node.id) return null

	const classes = useStyles();

	return (
		<TreeItem key={node?.id}
			nodeId={node.id}
			label={node?.name}
			classes={{ group: classes.group }}
		>
			{Array.isArray(node?.children) 
				? node.children.map((child) => <TreeMenuItem key={child.id} node={child} />) 
				: null 
			}
		</TreeItem>
	)
}


const useStyles = makeStyles(theme => ({
	iconContainer: {
		'& .close': {
			opacity: 0.3,
		},
	},
	group: {
		marginLeft: 7,
		paddingLeft: 18,
		borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
	},
}))
