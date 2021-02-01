/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';

import { useUser } from '../../store/user';
import { useLayout } from '../../store/layout';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Button, Paper } from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
// import { useConfirmation } from '../../lib/input/confirmation';
// import { dialogDelete } from '../../store/layout/templates';
import Form from '../../components/common/form/Form';
import EditDialog from './EditDialog';


export default function UserPage() {

	const { state: user, fetchAll, dialogOpen } = useUser();
	const { setTitle } = useLayout()
	const { t } = useTranslation();
	const classes = useStyles();

	useEffect(() => {
		setTitle(t("pag.user.title"))
		fetchAll();
	}, [])

	//const cnf = useConfirmation()

	return (<Form
		renderFooter={
			<Button
				variant="contained"
				color="primary"
				startIcon={<AddIcon />}
				onClick={() => dialogOpen()}
			>
				{t("pag.user.btt_new")}
			</Button>
		}
	>
		<TableContainer component={Paper}>
			{user.all ? (

				<Table className={classes.table} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>{t("pag.user.tbl.username")}</TableCell>
							<TableCell>{t("pag.user.tbl.role")}</TableCell>
							<TableCell align="center" className={classes.actionsCell}>
								{t("pag.user.tbl.actions")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{user.all.map(item => (

							<TableRow hover key={item.id}
								onClick={() => dialogOpen(item.id)}
							>
								<TableCell >{item.username}</TableCell>
								<TableCell >{t(`app.roles.${item.role}`)}</TableCell>
								<TableCell align="center" className={classes.actionsCell}>
									<IconButton id="btt-delete"
										// onClick={e => cnf(dialogDelete, () => destroy(item.id), e)}
									><DeleteIcon /></IconButton>
								</TableCell>
							</TableRow>

						))}
					</TableBody>
				</Table>

			) : (<div>...</div>)}
		</TableContainer>

		<EditDialog />
		
	</Form>)
}



const useStyles = makeStyles({
	table: {
		//minWidth: 650,
	},
	container: {
		display: "flex",
		justifyContent: "flex-end",
		marginTop: "14px",
	},
	actionsCell: {
		width: "100px"
	} 
});