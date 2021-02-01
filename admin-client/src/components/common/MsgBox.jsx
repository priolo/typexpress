/* eslint eqeqeq: "off" */
import React from 'react';

import { makeStyles, Snackbar, IconButton, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

import { useLayout } from '../../store/layout';


export default function MsgBox() {

	const { state, dialogClose } = useLayout()
	const classes = useStyles();

	return state.dialogModal ? (
		<Dialog
			open={state.dialogIsOpen}
			onClose={() => dialogClose(false)}
		>

			<DialogTitle
				className={classes[state.dialogType]}
			//classes={{root:classes[state.dialogType]}}
			>
				{state.dialogTitle}
			</DialogTitle>

			<DialogContent>
				<DialogContentText>
					{state.dialogText}
				</DialogContentText>
			</DialogContent>

			<DialogActions>
				{state.dialogLabelCancel && (
					<Button color="secondary"
						onClick={() => dialogClose(false)}
					>
						{state.dialogLabelCancel}
					</Button>
				)}
				<Button color="primary" autoFocus
					onClick={() => dialogClose(true)}
				>
					{state.dialogLabelOk}
				</Button>
			</DialogActions>

		</Dialog>
	) : (
			<Snackbar ContentProps={{ className: classes[state.dialogType] }}
				open={state.dialogModal == false && state.dialogIsOpen}
				autoHideDuration={6000}
				onClose={dialogClose}
				message={state.dialogText}
				action={
					<IconButton size="small" aria-label="close" color="inherit" onClick={dialogClose}>
						<CloseIcon fontSize="small" />
					</IconButton>
				}
			/>
		)
}

const useStyles = makeStyles((theme) => ({
	info: {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
	},
	warning: {
		backgroundColor: theme.palette.warning.main,
		color: theme.palette.warning.contrastText,
	},
	error: {
		backgroundColor: theme.palette.error.main,
		color: theme.palette.error.contrastText,
	},
	success: {
		backgroundColor: theme.palette.success.main,
		color: theme.palette.success.contrastText,
	},
}))
