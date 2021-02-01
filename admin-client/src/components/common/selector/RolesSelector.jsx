import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Roles } from '../../../store/user/roles';


export default function RolesSelector({
	label,
	value,
	onChange,
	disabled,
}) {

	const { t } = useTranslation();
	
	return (
		<FormControl>
			<InputLabel id="demo-simple-select-label">{label}</InputLabel>
			<Select autoWidth
				labelId="demo-simple-select-label"
				id="demo-simple-select"
				value={value}
				onChange={onChange}
				disabled={disabled}
			>
				{Roles.map( i => (
					<MenuItem key={i.code} 
						value={i.code}
					>
						{t(`app.roles.${i.code}`)}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}
