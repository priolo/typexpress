import React from 'react'

import { useTranslation } from "react-i18next"
import { useAuth } from '../../store/auth'

import { Typography, Button } from "@material-ui/core"
import { VpnKey as PasswordIcon } from '@material-ui/icons';
import FormParagraph from "../../components/common/form/FormParagraph"
import FormRow from "../../components/common/form/FormRow"
import ChangePasswordDialog from './ChangePasswordDialog';



export default function TrackingForm() {

	const { t } = useTranslation()
	const { state: auth, setIsChangePasswordOpen } = useAuth()

	return (<>
		<FormParagraph title={t("pag.profile.par_general")}
			renderFooter={<>
				<Button variant="contained" disableElevation color="primary" startIcon={<PasswordIcon />}
					onClick={()=>setIsChangePasswordOpen(true)}
				>
					{t("pag.profile.btn_change_password")}
				</Button>
			</>}
		>

			<FormRow label={t("pag.profile.prp_username")}>
				<Typography>{auth.user.username}</Typography>
			</FormRow>

			<FormRow label={t("pag.profile.prp_role")}>
				<Typography>{t(`app.roles.${auth.user.role}`)}</Typography>
			</FormRow>

		</FormParagraph>

		<ChangePasswordDialog />
	</>)
}
