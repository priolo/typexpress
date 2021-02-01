/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Typography, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { useAuth } from '../../store/auth';
import { useParams } from 'react-router-dom';



export function ActivatePag() {

	const classes = useStyles()
	const { state: auth, activate } = useAuth()
	const {token} = useParams()

	useEffect(() => {
		activate(token)
	}, [])

	return (
		<Container component="main" maxWidth="xs">
			<div className={classes.paper}>

				<Typography component="h1" variant="h5">
					e mo lo attiviamo
				</Typography>

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