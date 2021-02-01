/* eslint eqeqeq: "off" */
import { admin as adminMenu, crew as crewMenu, guest as guestMenu } from "./menu"
import { getStoreAuth } from "../auth";
import { themeLight, themeDark } from "../../theme"
import Cookies from 'js-cookie'
import {mixStore } from "@priolo/iistore"
import dialogStore from "./dialog"
import formStore from "./form"



const layout = {
	state: {
		busy: false,
		title: "",
		focus: "",
		drawerIsOpen: true,

		theme: Cookies.get('theme') == "dark" ? themeDark : themeLight,
	},
	getters: {
		getDrawerList: (state, payload, store) => {
			const { state: auth } = getStoreAuth()
			return auth.user == null
				? guestMenu
				: auth.user.role == 100
					? adminMenu
					: crewMenu
		},
		isDarkTheme: (state, payload, store) => state.theme == themeDark,
	},
	actions: {
		
	},
	mutators: {
		setBusy: (state, busy) => ({ busy }),
		setTitle: (state, title) => ({ title }),
		setFocus: (state, focus) => ({ focus }),
		toggleTheme: (state) => {
			Cookies.set("theme", state.theme == themeLight ? "dark" : "light" )
			return {
				theme: state.theme == themeLight ? themeDark : themeLight
			}
		},

		setDrawerIsOpen: (state, drawerIsOpen) => ({ drawerIsOpen }),
	},
}

export default mixStore(layout, dialogStore, formStore)
