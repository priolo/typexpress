/* eslint eqeqeq: "off" */
import React from 'react';
import { Input, makeStyles, Grid, IconButton } from '@material-ui/core';
import { ArrowLeft as DownIcon, ArrowRight as UpIcon } from '@material-ui/icons';


export default function InputAngle({
	value,
	onChange,
	disabled,
}) {

	const classes = useStyles()

	const handleChange = value => {
		if (value > 360) value = value % 360
		if (value < 0) value = 360 + (value % 360)
		if (isNaN(value)) value = 0
		if (onChange) onChange(value)
	}

	return (
		<Grid container alignItems="center">
			<IconButton color="inherit" onClick={() => handleChange(--value)}>
				<DownIcon aria-label="decrement icon" />
			</IconButton>
			<Grid item container sm className={classes.input}>
				<Input inputProps={{ min: 0, style: { textAlign: 'center' } }}
					type="number"
					value={value}
					onChange={e => handleChange(e.target.value)}
					disabled={disabled}
					onWheel={e => handleChange(value-=(e.deltaY/100))}
					endAdornment="°"
				/>
			</Grid>
			<IconButton color="inherit" onClick={() => handleChange(++value)}>
				<UpIcon aria-label="increment icon" />
			</IconButton>
		</Grid>
	)
}


const useStyles = makeStyles(theme => ({
	input: {
		maxWidth: "35px"
	}
}))