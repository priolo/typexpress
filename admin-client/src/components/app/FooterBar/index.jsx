import React from 'react';

import { makeStyles, Typography } from '@material-ui/core';

export default function FooterBar () {

	const classes = useStyles()

    return (
        <div className={classes.root}>
			<Typography variant="caption">Copyright 2020</Typography>
			<div className={classes.space}></div>
        </div>
    );
}

const useStyles = makeStyles( theme => ({
    root: {
		display: 'flex', alignItems: "center",
		position: "fixed", bottom: 0, zIndex: 1201,
		width: "100%", height: theme.app.footerbar.height,
		padding: theme.spacing(0,2),
		backgroundColor: theme.palette.background.paper,
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
	},
	space: {
		flex: "1 1 0%"
	},
}))
