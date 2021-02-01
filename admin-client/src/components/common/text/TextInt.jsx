import React from 'react';

import { Typography } from "@material-ui/core";


export default function TextInt({
	value,
}) {
	return <Typography variant="body1">{value!=null?value:"--"}</Typography>
}
