/* eslint eqeqeq: "off" */
import React from 'react';
import { Link, makeStyles } from "@material-ui/core"


export default function FormMenuLink({
	label,
	id
}) {

	const classes = useStyles()
	const handleScroll = (id) => {
		const y = document.getElementById(id).getBoundingClientRect().top + window.scrollY - 70
		window.scroll({
			top: y,
			behavior: 'smooth'
		});
	}

	return (
		<Link underline="none" onClick={()=>handleScroll(id)} className={classes.link}>
			{label}
		</Link>
	)
}

const useStyles = makeStyles( theme => ({
	link: {
		marginBottom: theme.spacing(2),
		cursor: "pointer",
	},
}));