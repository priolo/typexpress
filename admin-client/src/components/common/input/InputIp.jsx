/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useRef } from 'react';

import InputExa from './InputExa';


export default function InputIp({
	value,
	onChange,
	disabled,
}) {

	const values = decompose(value)

	const inputsRef = []
	inputsRef[0] = useRef();
	inputsRef[1] = useRef();
	inputsRef[2] = useRef();
	inputsRef[3] = useRef();

	const handleNext = pos => {
		if (pos == 3) return;
		const input = inputsRef[pos + 1]
		input.current.focus()
		setTimeout(() => input.current.setSelectionRange(0, input.current.value.length), 100)
	}

	const handlePrev = pos => {
		if (pos == 0) return;
		const input = inputsRef[pos - 1]
		input.current.focus()
		setTimeout(() => input.current.setSelectionRange(0, input.current.value.length), 100)
	}

	const handleChange = (pos, subvalue) => {
		const values = decompose(value)
		values[pos] = subvalue
		onChange(compose(values))
	}

	return (
		<div style={{ display: "flex" }}>
			<InputExa
				inputRef={inputsRef[0]}
				value={values[0]}
				onChange={e => handleChange(0, e.target.value)}
				onNext={() => handleNext(0)}
				onPrev={() => handlePrev(0)}
				disabled={disabled}
			/>
			<div style={stylePoint}>.</div>
			<InputExa
				inputRef={inputsRef[1]}
				value={values[1]}
				onChange={e => handleChange(1, e.target.value)}
				onNext={() => handleNext(1)}
				onPrev={() => handlePrev(1)}
				disabled={disabled}
			/>
			<div style={stylePoint}>.</div>
			<InputExa
				inputRef={inputsRef[2]}
				value={values[2]}
				onChange={e => handleChange(2, e.target.value)}
				onNext={() => handleNext(2)}
				onPrev={() => handlePrev(2)}
				disabled={disabled}
			/>
			<div style={stylePoint}>.</div>
			<InputExa
				inputRef={inputsRef[3]}
				value={values[3]}
				onChange={e => handleChange(3, e.target.value)}
				onNext={() => handleNext(3)}
				onPrev={() => handlePrev(3)}
				disabled={disabled}
			/>
		</div>
	)
}

InputIp.displayName = "InputIp"

const stylePoint = {
	margin: "0px 5px 0px 5px",
	alignSelf: "flex-end",
	height: "14px",
}

const decompose = value => {
	if (value == null || value.trim().length == 0) return ["0", "0", "0", "0"]
	return value.split(".").slice(0, 4)
}
const compose = (values) => `${values[0]}.${values[1]}.${values[2]}.${values[3]}`
