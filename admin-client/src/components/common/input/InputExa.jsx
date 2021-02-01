/* eslint eqeqeq: "off" */
import React from 'react';
import { Input } from '@material-ui/core';


export default function InputExa ({
	value,
	onChange,
	onNext,
	onPrev,
	inputRef,
	disabled,
}) {

	const handleChange = e => {
		let value = e.target.value
		if ( +value>255) {
			e.preventDefault()
			return 
		}
		onChange(e)
		if ( +(value+"0") > 255 ) onNext()
	}

	const handleKeyDown = e => {
		if ( (e.keyCode < 48 || e.keyCode > 57) 
			&& e.keyCode != 9 && e.keyCode != 9 && e.keyCode != 8 && e.keyCode != 46 
			&& (e.keyCode < 37 || e.keyCode > 40)
		) {
			e.preventDefault()
			return
		}
		if ( e.keyCode==37 && e.target.selectionStart==0 ) onPrev()
		if ( e.keyCode==39 && e.target.selectionStart==value.length ) onNext()
	}

	const handleFocus = e => {
		e.target.setSelectionRange(0, e.target.value.length)
	}

	return (
		<Input inputProps={{min: 0, style: { textAlign: 'center' }}}
			inputRef={inputRef}
			value={value}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			disabled={disabled}
		/>
	)
}