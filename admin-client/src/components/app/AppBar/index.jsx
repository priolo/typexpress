import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import { Menu as MenuIcon, Notifications as NotificationsIcon } from '@material-ui/icons';
import { AppBar, Toolbar, Typography, IconButton, LinearProgress, Badge } from '@material-ui/core';

import { useLayout } from '../../../store/layout';
import Avatar from '../Account/Avatar';
import CentralSpace from '../CentralSpace';
import { Switch, Route } from 'react-router-dom';
//import HeaderSatellites from "../../../pages/Satellite/Header"

export default function AppBarExp () {

	const classes = useStyles();
	const { state: layout, setDrawerIsOpen } = useLayout()


	return (
		<AppBar
			position="fixed"
			className={clsx(classes.appBar, {
				[classes.appBarShift]: layout.drawerIsOpen,
			})}
		>
			<Toolbar>

				{/* Button for toggle drawer */}
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={() => setDrawerIsOpen(!layout.drawerIsOpen)}
					edge="start"
					className={clsx(classes.menuButton, {
						[classes.hide]: layout.drawerIsOpen,
					})}
				>
					<MenuIcon />
				</IconButton>

				<CentralSpace
					renderLeft={
						<Typography variant="h6" noWrap className={classes.title}>
							{layout.title}
						</Typography>
					}
					renderRight={<>
						<div className={classes.grow}></div>
						<IconButton color="inherit">
							<Badge badgeContent={3} color="error">
								<NotificationsIcon />
							</Badge>
						</IconButton>
						<Avatar />
					</>}
				>

					<Switch>
						<Route path="/users">
							{/* <HeaderSatellites /> */}
						</Route>
					</Switch>

				</CentralSpace>

			</Toolbar>
			{layout.busy && <LinearProgress />}
		</AppBar>
	);
}


const useStyles = makeStyles(theme => ({
	appBar: {
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		marginLeft: theme.app.drawer.width,
		width: `calc(100% - ${theme.app.drawer.width}px)`,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginRight: 36,
	},
	hide: {
		display: 'none',
	},
	title: {
		minWidth: "150px"
	},
	grow: {
		flexGrow: 1,
	},

}));