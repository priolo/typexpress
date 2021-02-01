import React from 'react'
import { Button, Card, CardActions, CardContent, CardHeader, Divider, Typography } from '@material-ui/core';
import { Replay as ReloadIcon } from '@material-ui/icons';
import i18n from "i18next"


export default class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { 
			hasError: false,
			msg: "",
		}
	}

	handleClickReload = (e) => {
		this.setState({ hasError: false })
	}

	static getDerivedStateFromError(error) {
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		this.setState({ msg: error.message })
	}

	render() {
		if (this.state.hasError) {
			return (<Card style={cardStyle}>
				<CardHeader title={i18n.t("dialog.render_error.title")} />

				<CardContent>
					<Typography>{i18n.t("dialog.render_error.body")}</Typography>
					<Typography variant="body2">{this.state.msg}</Typography>
				</CardContent>
				
				<Divider />
				
				<CardActions>
					<Button 
						startIcon={<ReloadIcon/>}
						onClick={this.handleClickReload}
					>{i18n.t("dialog.render_error.reload")}</Button>
				</CardActions>
			</Card>)
		}
		return this.props.children;
	}
}

const cardStyle = {
	"marginBottom": "auto",
    "marginTop": "auto",
	"alignSelf": "center",
	"maxWidth": "450px",
}