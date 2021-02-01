import React from 'react';

import { Typography } from "@material-ui/core";


export default function TextAngle({
	value,
}) {
	return <Typography variant="body1">{value!=null?`${value}°`:"--"}</Typography>
}
