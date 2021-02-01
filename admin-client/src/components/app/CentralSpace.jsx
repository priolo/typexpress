import { makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import React from 'react'


export default function CentralSpace ({
	renderLeft,
	renderRight,
	children,
	className,
	isPage,
}) {

	const classes = useStyles()

	return (
		<div className={clsx(className,classes.central,{[classes.central_page]:isPage})}>

			<div className={classes.space}>
				{renderLeft}
			</div>

			<div className={clsx(classes.body,{[classes.body_page]:isPage})}>
				{children}
			</div>

			<div className={clsx(classes.space,{[classes.space_page]:isPage})}>
				{renderRight}
			</div>

		</div>
	)
}

const useStyles = makeStyles( theme => ({

    central: {
		display: "flex", flexDirection: "row", width: "100%", alignItems: "center"
	},
	space:  {
		flex: "1 1 0%", display: "flex",
	},
	body: {
		display: "flex", flex: "3 1 0%",
		minWidth: "400px", maxWidth: "700px",
	},

	central_page: {
		flexGrow: "1", alignItems: "stretch"
	},
	body_page: {
		margin: "40px 0 0 0",
		flexDirection: "column",
	},
	space_page: {
		display: "block",
	}
	
}))
