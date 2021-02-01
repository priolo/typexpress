/* eslint eqeqeq: "off" */
import React from 'react';
import { Divider, Box, Typography } from "@material-ui/core"


export default function FormSubtitle({
	title,
}) {

	return (<>
		<Typography>{title}</Typography>
		<Divider />
		<Box mt={2} />
	</>)
}

