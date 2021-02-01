/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import PasswordsFields from '../Password/PasswordsFields';

import { useTranslation } from 'react-i18next';
import { useAuth } from '../../store/auth';
import { validateAll } from '@priolo/iistore'


export default function ChangePasswordDialog () {

	const { state: auth, setIsChangePasswordOpen, changePassword } = useAuth()
	const { t } = useTranslation();
	const handleSave = async () => {
		const result = await changePassword()
		if ( result.error ) return
		setIsChangePasswordOpen(false)
	}
	let passwordsRules = null
	const handleGetRules = ( rules ) => {
		passwordsRules = rules
	}

	return (
		<Dialog fullWidth maxWidth="xs"
			open={auth.isChangePasswordOpen}
			onClose={() => setIsChangePasswordOpen(false)}
		>
			<DialogTitle>
				{t(`pag.profile.dlg.title`)}
			</DialogTitle>

			<DialogContent>
				<PasswordsFields onGetRules={handleGetRules} />
			</DialogContent>

			<DialogActions>
				<Button color="secondary"
					onClick={() => setIsChangePasswordOpen(false)}
				>
					{t(`pag.profile.dlg.cancel`)}
				</Button>
				<Button color="primary" autoFocus
					onClick={() => validateAll( handleSave, passwordsRules )}
				>
					{t(`pag.profile.dlg.save`)}
				</Button>
			</DialogActions>

		</Dialog>
	)
}
