/* eslint eqeqeq: "off" */
import React from 'react';
import { Typography } from '@material-ui/core';


export default function TextEnum({
	value, 
	enumeration
}) {
	const enumValue = Object.keys(enumeration).find(k=>enumeration[k]==value)

	return <Typography variant="body2">{enumValue ? enumValue : "--"}</Typography>
}
