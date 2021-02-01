import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Search as SearchIcon, Clear as ClearIcon} from '@material-ui/icons';
import { InputBase, fade, IconButton } from '@material-ui/core';


export default function SearchBox ({
	value,
	onChange,
}) {

	const classes = useStyles();

	return (
		<div className={classes.search}>
			<div className={classes.searchIcon}>
				<SearchIcon />
			</div>
			<InputBase
				placeholder="Search…"
				classes={{
					root: classes.inputRoot,
					input: classes.inputInput,
				}}
				value={value}
				onChange={e=>onChange(e.target.value)}
				endAdornment={value!=null && value.length>0 && (
					<IconButton color="inherit" style={{padding: "0 5px"}}
						onClick={e=>onChange("")}
					><ClearIcon /></IconButton>
				)}
			/>
		</div>
	)
}



const useStyles = makeStyles((theme) => ({

	search: {
		position: 'relative', width: '100%',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		width: '100%',
	},

}));