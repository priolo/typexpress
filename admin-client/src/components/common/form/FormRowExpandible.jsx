/* eslint eqeqeq: "off" */
import React from 'react';
import { makeStyles, IconButton, Collapse, Divider, Box, Grid } from "@material-ui/core"
import { ExpandMore } from '@material-ui/icons';
import FormRow from './FormRow';
import clsx from 'clsx';


export default function FormRowExpandible({
	children,
	...props
}) {

	const classes = useStyles();
	const [expanded, setExpanded] = React.useState(false);

	return (<>
		<Box mt={3}/>
		<Divider className={classes.divider}/>
		<FormRow {...props} onClickLabel={() => setExpanded(!expanded)}>
			<Grid item sm />
			<IconButton onClick={() => setExpanded(!expanded)}
				className={clsx(classes.expand, { [classes.expandOpen]: expanded, })}
			>
				<ExpandMore />
			</IconButton>
		</FormRow>
		<Collapse in={expanded} timeout="auto" unmountOnExit>
			{children}
			<Box mt={3} />
		</Collapse>
	</>)
}


const useStyles = makeStyles(theme => ({
	expand: {
		transform: 'rotate(0deg)',
		
		transition: theme.transitions.create('transform', {
			duration: theme.transitions.duration.shortest,
		}),
	},
	expandOpen: {
		transform: 'rotate(180deg)',
	},
	divider: {
		margin:"9px -32px;",
	}
}))