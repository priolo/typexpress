import React from 'react';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import TreeMenuView from "./TreeMenuView"
import { useLayout } from '../../../store/layout';
import { Button } from '@material-ui/core';


export default function MyDrawer() {

    const classes = useStyles()
    const { state: layout, setDrawerIsOpen } = useLayout()
    
    return (
        <Drawer
            variant="permanent"
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: layout.drawerIsOpen,
                [classes.drawerClose]: !layout.drawerIsOpen,
            })}
            classes={{
                paper: clsx(classes.drawerPaper, {
                    [classes.drawerOpen]: layout.drawerIsOpen,
                    [classes.drawerClose]: !layout.drawerIsOpen,
                }),
            }}
        >
            <div className={classes.toolbar}>
                <IconButton onClick={() => setDrawerIsOpen(!layout.drawerIsOpen)}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            <TreeMenuView />
        </Drawer>
    );
}


const useStyles = makeStyles(theme => ({
    drawer: {
        width: theme.app.drawer.width,
        flexShrink: 0,
        whiteSpace: 'nowrap',
    },
    drawerPaper: {
        //height: `calc(100% - ${theme.app.footerbar.height}px)`
        height: "100%"
    },
    drawerOpen: {
        width: theme.app.drawer.width,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowX: 'hidden',
        width: theme.spacing(7) + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9) + 1,
        },
    },
    toolbar: {
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        padding: theme.spacing(0, 1),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
    },
}));
