import React, { useEffect } from 'react'

import { Switch, Route } from "react-router-dom"

import { makeStyles } from '@material-ui/core'

import Drawer from '../Drawer'
import AppBar from '../AppBar'
import Body from '../Body'
import FooterBar from '../FooterBar'

import UserPage from "../../../pages/User"
import ProfilePage from '../../../pages/Profile'
import Err from '../../common/ErrorBoundary'
import NodePage from '../../../pages/Node'


export default function MainLayout () {

    const classes = useStyles()

    return (<>
        <AppBar />
        <div className={classes.container}>
            <div className={classes.center}>
                <Drawer />
                <Body>
                    <Err>
                        <Switch>
                            <Route path="/node/:id">
                                <Err><NodePage /></Err>
                            </Route>
                            <Route path="/users">
                                <Err><UserPage /></Err>
                            </Route>
                            <Route path="/profile">
                                <Err><ProfilePage /></Err>
                            </Route>
                        </Switch>
                    </Err>
                </Body>
            </div>
            <FooterBar />
        </div>
    </>);
}

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex', flexDirection: "column",
        height: "100%",
    },
    center: {
        display: 'flex',
        height: "100%"
    }
}))
