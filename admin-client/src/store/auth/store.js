/* eslint eqeqeq: "off" */
import ajax from "../../plugin/AjaxService";
import Cookies from 'js-cookie'
import i18n from "i18next";
import { getStoreNode } from "../node";

let idPolling = null

const store = {
	state: {
		user: null, //{ id:<???>, username:<string>, has_to_change_password:<bool>, role:<???> }
		token: Cookies.get('token'),

		username: "",
		oldpassword: "",
		password: "",
		repassword: "",
		isChangePasswordOpen: false,
	},
	getters: {
		isLogged: state => state.token != null && state.user != null,
		// isRepassword: state => {
		// 	return state.user != null && state.user.has_to_change_password == true
		// },
	},
	actions: {
		activate: async (state, token, store, { dialogOpen }) => {
			store.setToken(token)
			const {response} = await ajax.post("auth/activate", { token })
			if ( response=="activate" ) {
				window.location.href = "/"
				return
			}
			dialogOpen({ 
				type: "success", 
				text: i18n.t( "app.auth.msg_sigin_fail"), 
				modal: false 
			})
		},
		signin: async (state, payload, store, { dialogOpen }) => {
			const data = {
				username: state.username,
				password: state.password,
			}
			store.resetTexts() // remove password from memory
			const response = await ajax.post("auth/signin", data);
			dialogOpen({ type: "success", text: i18n.t("app.auth.msg_sigin"), modal: false })
		},
		login: async (state, payload, store, { dialogOpen }) => {
			const data = {
				username: state.username,
				password: state.password,
			}

			store.resetTexts() // remove password from memory

			try {
				const response = await ajax.post("auth/login", data);
				store.setToken(response.access_token)
			} catch (error) {
				store.logout()
				return;
			}

			// msg success!!
			dialogOpen({ type: "success", text: i18n.t("app.auth.msg_login"), modal: false })
			// get the user
			await store.fetchCurrentUser()
		},
		logout: (state, { flash } = { flash: false }, store, { dialogOpen }) => {
			store.stopPollingRefreshToken()
			store.setToken(null)
			store.setUser(null)
			if (flash) dialogOpen({ type: "success", text: i18n.t("app.auth.msg_logout"), modal: false })
		},
		refresh: async (state, payload, store) => {
			if (state.token == null) return
			await store.fetchCurrentUser()
		},
		changePassword: async (state, payload, store, { dialogOpen }) => {
			const data = {
				old_password: state.oldpassword,
				new_password: state.repassword,
			}
			store.resetTexts()

			try {
				await ajax.patch(`users/${state.user.id}/password`, data);
			} catch (e) {
				return { error: true }
			}

			dialogOpen({
				type: "success",
				text: i18n.t("pag.password.msg_success"),
				modal: false,
			})
			store.setUser({ ...state.user, has_to_change_password: false })
			return { error: false }
		},
		fetchCurrentUser: async (state, payload, store, { setDrawerListByUser }) => {
			try {
				const response = await ajax.get("user/me")
				store.setUser(response)
			} catch (error) {
				store.logout()
			}
			const { fetchRoot } = getStoreNode()
			await fetchRoot()
		},
		refreshToken: async (state, payload, store) => {
			try {
				const response = await ajax.get("auth/refresh", null, { noBusy: true });
				store.setToken(response.access_token)
			} catch (error) {
				store.logout()
			}
		},
		startPollingRefreshToken: (state, payload, store) => {
			if (idPolling != null) return;
			const delay = process.env.REACT_APP_TOKEN_POLLING_TIME != null ? +process.env.REACT_APP_TOKEN_POLLING_TIME : 720000
			idPolling = setInterval(() => {
				store.refreshToken()
			}, delay)
		},
		stopPollingRefreshToken: (state, payload, store) => {
			if (idPolling == null) return;
			clearInterval(idPolling)
			idPolling = null
		},
	},
	mutators: {
		// [II] deve essere il layout che pesca lo user e adatta la lista non il contrario
		setUser: (state, user, store, { setDrawerListByUser }) => ({ user }),
		setToken: (state, token, store) => {
			if (token == null) {
	debugger
				Cookies.remove('token');
			} else {
				Cookies.set('token', token) //, { expires: remember ? 365 : null });
			}
			return { token }
		},
		setIsChangePasswordOpen: (state, isChangePasswordOpen) => ({ isChangePasswordOpen }),

		setUsername: (state, username) => ({ username }),
		setPassword: (state, password) => ({ password }),
		setOldPassword: (state, oldpassword) => ({ oldpassword }),
		setRepassword: (state, repassword) => ({ repassword }),
		resetTexts: (state) => ({ username: "", password: "", repassword: "", oldpassword: "" }),
	},
}

export default store