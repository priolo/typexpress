/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useRef } from 'react';
import { Input, IconButton, makeStyles } from '@material-ui/core';
import { ArrowLeft as DownIcon, ArrowRight as UpIcon } from '@material-ui/icons';
import { useEffect } from 'react';


export default function InputInt({
	value,
	onChange,
	isFloat,
	disabled,
}) {

	const inputRef = useRef()

	useEffect( () =>{
		const inp = inputRef.current
		inp.addEventListener('wheel', handleWheel, { passive: false } )
		return ()=>inp.removeEventListener('wheel', handleWheel)
	},[inputRef])

	const classes = useStyles()
	
	const handleChange = value => {
		if (value=="") onChange(null)
		let valueNum = parseFloat(value)
		if (isNaN(valueNum)) return
		if ( !isFloat ) valueNum = Math.trunc(valueNum)
		if (onChange) onChange(valueNum)
	}

	const handleWheel = e => {
		e.preventDefault()
		e.stopPropagation()
		handleChange((+e.target.value) - (e.deltaY / 100))
	}

	const handleBlur = e => {
		if (e.target.value==null || e.target.value.length==0 || isNaN(e.target.value)) handleChange(0)
	}
	
	return (
		<Input inputProps={{ min: 0, style: { textAlign: 'center', minWidth: "28px" } }}
			innerRef={inputRef}
			type="number"
			value={value!=null?value:""}
			onChange={e => handleChange(e.target.value)}
			onBlur={handleBlur}
			disabled={disabled}
			
			endAdornment={
				<IconButton color="inherit" onClick={() => handleChange(++value)} className={classes.button}>
					<UpIcon aria-label="increment icon" />
				</IconButton>
			}

			startAdornment={
				<IconButton color="inherit" onClick={() => handleChange(--value)} className={classes.button}>
					<DownIcon aria-label="decrement icon" />
				</IconButton>
			}
		/>
	)
}



const useStyles = makeStyles((theme) => ({
	button: {
		padding: 0
	},
}))
