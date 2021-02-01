import React from 'react'
import { makeStyles } from "@material-ui/core"
import { useLayout } from '../../../store/layout'


export default function Form({
	children,
	leftRender,
	rigthRender
}) {

	const classes = useStyles()
	const { state:layout, getRigthOpen } = useLayout()
	const clsRigthExpanded = getRigthOpen()?"rigthExpanded":""

	return (
		<div className={classes.frame}>

			<div className={classes.container}>

				<div className={`${classes.left} ${clsRigthExpanded}`}>
					{leftRender}
				</div>

				<div className={classes.center}>
					{children}
				</div>

				<div className={`${classes.rigth} ${clsRigthExpanded}`}>
					{rigthRender}
				</div>

			</div>

		</div>
	)
}


const useStyles = makeStyles(theme => ({
	frame: {
		display: "flex", flexDirection: "column",
		height: "100%",
	},
	container: {
		display: "flex", flexDirection: "row", width: "100%",
	},


	left: {
		display: "flex", flexDirection: "column", flex: "1 1 0",
		transition: "flex-grow 0.5s",
		"&.rigthExpanded": {
			flex: "0 1 0",
			transition: "flex-grow 0.5s",
		}
	},

	center: {
		display: "flex", flexDirection: "column", flex: "3 1 0",
		padding: "49px 16px 16px 0px", margin: "0 20px",
	},

	rigth: {
		display: "flex", flexDirection: "column", flex: "1 1 0",
		transition: "flex-grow 0.4s",
		"&.rigthExpanded": {
			flex: "3 1 0",
			padding: "49px 16px 16px 0px", margin: "0 20px 0 0",
			transition: "flex-grow 0.4s",
		}
	},

}));