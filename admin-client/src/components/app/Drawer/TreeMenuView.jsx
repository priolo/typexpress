import React from 'react';

import { makeStyles } from '@material-ui/core/styles';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import TreeMenuItem from './TreeMenuItem';
import { useNode } from '../../../store/node';
import { useHistory } from 'react-router-dom';


export default function TreeMenuView() {

	const classes = useStyles();
	const { state: node } = useNode()
	const history = useHistory()

	const handleNodeSelect = (event, value) => {
		history.push(`/node/${value}`)
	}

	return (
		<TreeView
			onNodeSelect={handleNodeSelect}
			classes={{ root:classes.root }}
			defaultCollapseIcon={<ExpandMoreIcon />}
			defaultExpandIcon={<ChevronRightIcon />}
		>
			<TreeMenuItem node={node?.root} />
		</TreeView>
	)
}


const useStyles = makeStyles(theme=>({
	root: {
		height: 240,
		flexGrow: 1,
		maxWidth: 400,
	},
}))
