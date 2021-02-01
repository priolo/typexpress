import React from 'react';

import { Typography } from "@material-ui/core";
import { useTranslation } from 'react-i18next';


export default function TextString({
	value,
	translate,
	isUpperCase,
}) {
	const { t } = useTranslation();

	value = value == null ? "null" : value
	value = translate != null ? t(`${translate}.${value}`) : value
	value = isUpperCase ? value.toString().toUpperCase() : value
	
	return <Typography variant="body2">{value}</Typography>
}
