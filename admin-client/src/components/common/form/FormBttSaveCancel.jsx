/* eslint eqeqeq: "off" */
import React from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { SaveAlt as SaveIcon, Clear as CancelIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';


export default function FormBttSaveCancel({
	saveLabel, 
	onSaveClick, 
	cancelLabel, 
	onCancelClick
}) {

	const { t } = useTranslation();

	return (
	<Grid container>
		<Grid item>
			<Button disableElevation variant="contained" color="primary"
				startIcon={<SaveIcon />}
				onClick={onSaveClick}
			>
				{saveLabel || t("pag.default.btt_save")}
			</Button>
		</Grid>
		<Box ml={2} />
		<Grid item>
			<Button startIcon={<CancelIcon />}
				onClick={onCancelClick}
			>
				{cancelLabel || t("pag.default.btt_cancel")}
			</Button>
		</Grid>
	</Grid>
	)
}
