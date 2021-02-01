/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React from 'react';
import { Button, ButtonGroup, makeStyles, Typography } from '@material-ui/core';


export default function ToggleGroup({
	buttons,
	value,
	onChange,
	onDark,
	isDense
}) {

	const classes = useStyles({ style: onDark ? "dark" : "light" })

	const handleChange = b => {
		if (Array.isArray(value)) {
			const ret = [...value]
			const index = ret.indexOf(b.value)
			if (index == -1) {
				ret.push(b.value)
			} else {
				ret.splice(index, 1)
			}
			onChange(ret)
		} else {
			onChange(b.value)
		}
	}

	const isSelect = b => {
		if (Array.isArray(value)) {
			return value.indexOf(b.value) != -1
		} else {
			return value == b.value
		}
	}

	return (buttons != null && (
		<ButtonGroup fullWidth>
			{buttons.map((b, i) => (
				<Button key={i}
					data-cy={isSelect(b) ? "select" : "deselect"}
					classes={{ root: isSelect(b) ? classes.buttonSel : classes.buttonDesel}}
					onClick={() => handleChange(b)}
				>
					<Typography variant={isDense?"caption":"body2"} noWrap>{b.label}</Typography>
				</Button>
			))}
		</ButtonGroup>
	))
}

const useStyles = makeStyles(theme => ({

	buttonSel: props => props.style == "dark"
		? {
			backgroundColor: "#fff",
			color: "#000",
			'&:hover': {
				backgroundColor: theme.palette.primary.light,
			}
		} : {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
			'&:hover': {
				backgroundColor: theme.palette.primary.light,
			}
		},

	buttonDesel: props => props.style == "dark"
		? {
			backgroundColor: theme.palette.primary.dark,
			color: theme.palette.primary.light,
			'&:hover': {
				backgroundColor: theme.palette.primary.light,
				color: theme.palette.primary.dark,
			}
		} : {
			backgroundColor: theme.palette.background.default,
			color: theme.palette.text.disabled,
			'&:hover': {
				backgroundColor: theme.palette.primary.light,
				color: theme.palette.primary.dark,
			}
		},
}))




