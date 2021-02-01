import React from 'react';
import { makeStyles } from '@material-ui/core/styles';


export default function Body ({
	children,
}) {

	const classes = useStyles();

	return (
		<main className={classes.content}>
			<div className={classes.toolbar} id="toolbar_space"/>
			{children}
		</main>
	);
}


const useStyles = makeStyles((theme) => ({
	toolbar: {
		display: 'flex',
		...theme.mixins.toolbar,
	},
	content: {
		flexGrow: 1,
		display: "flex",
		flexDirection: "column",
	},
	container: {
		flexGrow: "1"
	}
}));