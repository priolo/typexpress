/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Tooltip, Grid, Box, makeStyles, Divider } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { useUser } from '../../store/user';
import { useLayout } from '../../store/layout';
import { useValidator, validateAll, rules } from '@priolo/iistore'

import { Assignment as ClipboardIcon } from '@material-ui/icons';
import RolesSelector from '../../components/common/selector/RolesSelector';


export default function EditDialog () {

	const { state: user, dialogClose, setItemInEdit, setDialogPassword2 } = useUser()
	const [eUsername, heUsername, hcUsername, rUsername] = useValidator([rules.obligatory])
	const [ePassword, hePassword, hcPassword, rPassword] = useValidator([rules.obligatory])
	const [ePassword2, hePassword2, hcPassword2, rPassword2, extra] = useValidator([rules.obligatory])
	const { t } = useTranslation();
	const { state: layout } = useLayout()
	const handleCopyToClipboard = () => {
		navigator.clipboard.writeText(user.itemInEdit.password)
	}
	const classes = useStyles()

	useEffect(() => {
		if (layout.focus == "username") rUsername.current.focus()
	}, [layout.focus])

	//[II] automatizzare
	useEffect(() => {
		if (user.dialogIsOpen == false) return
		setTimeout(() => rUsername.current.focus(), 500)
	}, [user.dialogIsOpen, rUsername])

	return (user.itemInEdit &&
		<Dialog fullWidth maxWidth="xs"
			open={user.dialogIsOpen}
			onClose={() => dialogClose(false)}
		>
			<DialogTitle classes={{ root: classes.title }}>
				{t(`pag.user.dlg.${user.itemInEdit.id ? "title_edit" : "title_new"}`)}
			</DialogTitle>

			<Divider />

			<DialogContent classes={{ root: classes.content }}>

				<Grid container alignItems="center">
					<Grid item sm>
						<TextField autoFocus fullWidth
							inputRef={rUsername}
							error={heUsername()}
							helperText={eUsername}
							label={t(`pag.user.dlg.lbl_username`)}
							margin="dense"
							value={user.itemInEdit.username}
							onChange={e => setItemInEdit({ ...user.itemInEdit, username: hcUsername(e) })}
						/>
					</Grid>
					<Box mr={2} />
					<Grid item>
						<RolesSelector label={t(`pag.user.dlg.lbl_role`)}
							value={user.itemInEdit.role}
							onChange={e => setItemInEdit({ ...user.itemInEdit, role: e.target.value })}
						/>
					</Grid>
				</Grid>

				{/* only new user */}
				{user.itemInEdit.id == null && (<>
					<TextField fullWidth
						type="password"
						inputRef={rPassword}
						error={hePassword()}
						helperText={ePassword}
						label={t(`pag.user.dlg.lbl_password`)}
						margin="dense"
						value={user.itemInEdit.password}
						onChange={evn => setItemInEdit({ ...user.itemInEdit, password: hcPassword(evn) })}
						InputProps={{
							endAdornment: (
								<Tooltip title={t(`app.tooltip.clipboard`)} placement="top">
									<IconButton onClick={handleCopyToClipboard}>
										<ClipboardIcon aria-label="copy in clipboard icon" />
									</IconButton>
								</Tooltip>
							)
						}}
					/>
					<TextField fullWidth
						type="password"
						inputRef={rPassword2}
						error={hePassword2()}
						helperText={ePassword2}
						label={t(`pag.user.dlg.lbl_password2`)}
						margin="dense"
						value={user.dialogPassword2}
						onChange={evn => setDialogPassword2(hcPassword2(evn))}
					/>
				</>)}
			</DialogContent>
		
			<DialogActions classes={{ root: classes.action }}>
				<Button color="secondary"
					onClick={() => dialogClose(false)}
				>
					{t(`pag.user.dlg.cancel`)}
				</Button>
				<Button color="primary" autoFocus
					onClick={() => validateAll(
						() => dialogClose(true),
						[extra(rules.repassword(user.itemInEdit.password))]
					)}
				>
					{t(`pag.user.dlg.save`)}
				</Button>
			</DialogActions>

		</Dialog>
	)
}


const useStyles = makeStyles(theme => ({
	title: {
		padding: "25px 50px 16px 50px",
	},
	subtitle: {
		color: theme.palette.grey.A700,
	},
	content: {
		paddingLeft: "50px",
		paddingRight: "50px"
	},
	action: {
		padding: "16px 34px 16px 40px",
	},
}))