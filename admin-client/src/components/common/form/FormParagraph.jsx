import React from 'react';
import { CardHeader, Card, CardContent, CardActions, makeStyles, CircularProgress, Divider } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';


export default function FormParagraph({
	id,
	title,
	children,
	renderFooter,
	footerBusy,
	bodyBusy,
	haveExpand,
}) {

	const classes = useStyles();

	return (
		<Card className={classes.root} id={id}>
			<CardHeader title={title} />
			
			<CardContent className={haveExpand ? classes.content : null}>
				{bodyBusy
					? <Skeleton animation="wave" variant="rect" height={200} />
					: children
				}
			</CardContent>
			{renderFooter && (<>
				<Divider className={classes.divider} />
				<CardActions className={classes.actions}>
					{footerBusy
						? <CircularProgress size={36} className={classes.progress} />
						: renderFooter
					}
				</CardActions>
			</>)}
		</Card>
	)
}


const useStyles = makeStyles((theme) => ({
	root: {
		padding: "9px 16px 16px 16px",
		marginBottom: theme.spacing(3),
	},
	content: {
		paddingBottom: "0px!important"
	},
	actions: {
		//marginTop: "10px",
		padding: "16px",
	},
	progress: {
		marginLeft: "8px",
	},
	divider: {
		margin: "9px -17px;",
	}
}));