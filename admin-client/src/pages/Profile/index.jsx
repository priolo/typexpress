/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';

import { useLayout } from '../../store/layout';
import { useTranslation } from 'react-i18next';

import GeneralForm from "./GeneralForm"
import Form from '../../components/common/form/Form';
import FormMenuLink from '../../components/common/form/FormMenuLink';


export default function ProfilePage() {

	const { setTitle } = useLayout()
	const { t } = useTranslation();
	useEffect(() => {
		setTitle(t("pag.profile.title"))
	}, [])

	return (
		<Form 
			renderMenu={<>
				<FormMenuLink label={t("pag.profile.par_general")} id="general" />
			</>}
		>
			<GeneralForm />
		</Form>
	)
}

