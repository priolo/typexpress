/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useState } from 'react';

import { makeStyles } from "@material-ui/core";
import clsx from 'clsx';
import { useEffect } from 'react';


export default function TextMutable({
	children,
	value,
	keyChange,
}) {

	const classes = useStyles()
	const [showChanged, setShowChanged] = useState(false)
	const [idTimeout, setIdTimeout] = useState(null)

	let firstTime = false;

	useEffect(() => {
		firstTime = true
	}, [])
	useEffect(() => {
		firstTime = true
	}, [keyChange])

	useEffect(() => {
		if (firstTime == true) {
			firstTime = false
			return
		}
		setShowChanged(true)
		if (idTimeout != null) {
			clearTimeout(idTimeout)
			setIdTimeout(null)
		}
		setIdTimeout(setTimeout(() => {
			setIdTimeout(null)
			setShowChanged(false)
		}, 1000))
	}, [value])


	return (
		<div className={clsx(classes.valueReadOnly, {
			[classes.valueReadOnlyChanged]: showChanged
		})}>
			{children}
		</div>
	)
}


const useStyles = makeStyles(theme => ({
	valueReadOnly: {
		padding: "10px",
		backgroundColor: theme.palette.background.default,
		borderRadius: theme.shape.borderRadius,
		transition: "all 2s ease",
		minWidth: "60px",
		textAlign: "center"
	},
	valueReadOnlyChanged: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		transition: "all .5s ease"
	}
}))