/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField } from '@material-ui/core';

import { useAuth } from '../../store/auth';
import { useLayout } from '../../store/layout';
import { useValidator, rules } from '@priolo/iistore'


export default function PasswordsFields({
	onGetRules,
	variant="standard"
}) {

	const { t } = useTranslation();
	const { state: auth, setPassword, setOldPassword, setRepassword } = useAuth();
	const [eOldPassword, heOldPassword, hcOldPassword, rOldPassword, extOldPassword] = useValidator([rules.obligatory])
	const [ePassword, hePassword, hcPassword, rPassword] = useValidator([rules.obligatory])
	const [ePassword2, hePassword2, hcPassword2, rPassword2, extra] = useValidator([rules.obligatory])
	const { state: layout } = useLayout()

	//[II] automatizzare
	useEffect(() => {
		if (auth.isChangePasswordOpen == false) return
		setTimeout(() => rOldPassword.current.focus(), 500)
	}, [auth.isChangePasswordOpen, rOldPassword])

	useEffect(() => {
		onGetRules([
			extra(rules.repassword(auth.password)),
			extOldPassword(rules.notTheSame(auth.password))
		])
	}, [extOldPassword, extra])

	return (<>

		<TextField fullWidth autoFocus
			disabled={layout.busy}
			inputRef={rOldPassword}
			label={t("pag.password.oldpassword")}
			type="password"
			variant={variant}
			margin="normal"
			value={auth.oldpassword}
			onChange={e => setOldPassword(hcOldPassword(e))}
			error={heOldPassword()}
			helperText={eOldPassword}
		/>

		<TextField fullWidth
			disabled={layout.busy}
			inputRef={rPassword}
			label={t("pag.password.password")}
			type="password"
			variant={variant}
			margin="normal"
			value={auth.password}
			onChange={e => setPassword(hcPassword(e))}
			error={hePassword()}
			helperText={ePassword}
		/>

		<TextField fullWidth
			disabled={layout.busy}
			inputRef={rPassword2}
			label={t("pag.password.repassword")}
			type="password"
			variant={variant}
			margin="normal"
			value={auth.repassword}
			onChange={e => setRepassword(hcPassword2(e))}
			error={hePassword2()}
			helperText={ePassword2}
		/>

	</>);
}

