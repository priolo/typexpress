/* eslint eqeqeq: "off" */
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Avatar, Button, Typography, Container, CircularProgress } from '@material-ui/core';
import { VpnKey as VpnKeyIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import PasswordsFields from "./PasswordsFields"

import { useAuth } from '../../store/auth';
import { useLayout } from '../../store/layout';
import { validateAll } from '@priolo/iistore'


export default function Password() {

	const classes = useStyles();
	const { t } = useTranslation();
	const { changePassword, logout } = useAuth();
	const { state: layout } = useLayout()

	let passwordsRules = null
	const handleGetRules = ( rules ) => passwordsRules = rules

	return (
		<Container component="main" maxWidth="xs">
			<div className={classes.paper}>

				<Avatar className={classes.avatar}>
					<VpnKeyIcon />
				</Avatar>

				<Typography component="h1" variant="h5">
					{t("pag.password.title")}
				</Typography>

				<PasswordsFields variant="outlined" onGetRules={handleGetRules} />

				{layout.busy == false ? (<>
					<Button fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						onClick={() => validateAll(changePassword, passwordsRules)}
					>
						{t("pag.password.btt_change")}
					</Button>
					<Button fullWidth
						onClick={()=>logout({flash:true})}
					>{t("pag.password.btt_logout")}</Button>
				</>) : (
					<CircularProgress />
				)}

			</div>

		</Container>
	);
}


const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));