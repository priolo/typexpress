/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import MsgBox from './components/common/MsgBox';
import MainLayout from './components/app/MainLayout';

import { LogInPag } from './pages/LogIn/LogInPag';
import { SignInPag } from './pages/LogIn/SignInPag';
import { ActivatePag } from './pages/LogIn/ActivatePag';
//import Password from './pages/Password';

import { useAuth } from './store/auth';
import { ThemeProvider } from '@material-ui/core';
import { useLayout } from './store/layout';
import { Route, Switch } from 'react-router-dom';



export default function App() {

	const { isLogged, isRepassword, refresh } = useAuth()
	const { state: layout } = useLayout()
	useEffect(() => { refresh() }, [])

	return (
		<ThemeProvider theme={layout.theme}>
			<CssBaseline />
			<MsgBox />
			{ isLogged() == false ? (
				<Switch>
					<Route exact path="/activate/:token">
						<ActivatePag />
					</Route>
					<Route path="/signin">
						<SignInPag />
					</Route>
					<Route path="*">
						<LogInPag />
					</Route>
				</Switch>
			) : 
			// isRepassword() ? (
			// 	<Password />
			// ) : 
			(
				<MainLayout />
			)}
		</ThemeProvider>
	)
}

