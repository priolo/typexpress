import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { AccountCircle as AccountIcon, ExitToApp as LogoutIcon, Face as ProfileIcon } from '@material-ui/icons';
import { IconButton, Menu, MenuItem, Typography, Box, Divider, ListItemIcon, Switch } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../../store/auth"
import { useHistory } from "react-router-dom";
import { useLayout } from '../../../store/layout';


export default function Avatar() {

	const classes = useStyles()
	const history = useHistory()
	const [anchorEl, setAnchorEl] = useState(null)
	const { t } = useTranslation()
	const { state: auth, logout } = useAuth()
	const { toggleTheme, isDarkTheme } = useLayout()

	const handleClose = () => setAnchorEl(null)
	const handleOpen = e => setAnchorEl(e.currentTarget)
	const handleLogout = e => {
		handleClose()
		logout({ flash: true })
	}
	const handleProfile = e => {
		handleClose()
		history.push("/profile")
	}


	return (<>

		<IconButton color="inherit" onClick={handleOpen}>
			<AccountIcon aria-label="account icon" />
		</IconButton>

		<Menu id="simple-menu"
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={handleClose}
		>
			<Box className={classes.box}>
				<Typography variant="subtitle2">{auth.user.username}</Typography>
				<Typography variant="caption">({t(`app.roles.${auth.user.role}`)})</Typography>
			</Box>

			<Divider />

			<MenuItem onClick={toggleTheme}>
				<ListItemIcon>
					<Switch edge="start"
						checked={isDarkTheme()}
					/>
				</ListItemIcon>
				{t("app.avatar.dark")}
			</MenuItem>

			<MenuItem onClick={handleProfile}>
				<ListItemIcon>
					<ProfileIcon fontSize="small" />
				</ListItemIcon>
				{t("app.avatar.profile")}
			</MenuItem>

			<MenuItem onClick={handleLogout}>
				<ListItemIcon>
					<LogoutIcon fontSize="small" />
				</ListItemIcon>
				{t("app.avatar.logout")}
			</MenuItem>
		</Menu>
	</>);
}



const useStyles = makeStyles((theme) => ({
	box: {
		padding: theme.spacing(1, 2, 1, 2),
		display: "flex", flexDirection: "column"
	}
}));