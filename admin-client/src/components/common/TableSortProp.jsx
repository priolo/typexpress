/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import { TableSortLabel } from '@material-ui/core';
import React from 'react';

export default function TableSortProp ({
	children,
	name,
	sortName,
	isAsc,
	onSort,
}) {

	return (
		<TableSortLabel
			active={sortName == name}
			direction={isAsc ? "asc" : "desc"}
			onClick={() => onSort(name)}
		>{children}
		</TableSortLabel>
	)
}