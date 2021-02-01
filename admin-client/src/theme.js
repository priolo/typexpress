import { red, yellow, green, blue, cyan } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
//import { useState } from 'react';

const themeCommon = {
	app: {
		footerbar: {
			height: 30,
			zIndex: 1201
		},
		drawer: {
			width: 240
		}
	}
}

export const themeLight = createMuiTheme({
	...themeCommon,
	palette: {
		type: "light",
		primary: {
			main: blue[800],
		},
		secondary: {
			main: cyan[800],
		},
		error: {
			main: red[800],
		},
		warning: {
			main: yellow[800],
		},
		success: {
			main: green[800],
		},
	}
})

export const themeDark = createMuiTheme({
	...themeCommon,
	palette: {
		type: "dark",
		primary: {
			main: blue[600],
		},
		secondary: {
			main: cyan[600],
		},
		error: {
			main: red[600],
		},
		warning: {
			main: yellow[600],
		},
		success: {
			main: green[600],
		},
	},
})
