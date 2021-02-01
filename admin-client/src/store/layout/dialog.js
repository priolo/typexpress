/* eslint eqeqeq: "off" */

// used when dialog closed
let resolveClose = null;

const dialog = {
	state: {
		dialogIsOpen: false,
		dialogTitle: "",
		dialogText: "",
		dialogLabelOk: "",
		dialogLabelCancel: null,
		dialogModal: true, // false: Snackbar; true: Dialog
		dialogType: "info",	// "info" "warning" "error" "success"
	},
	getters: {
	},
	actions: {
		dialogOpen: (state, payload, store) => {
			store.setDialogOpen(payload)
			return new Promise((resolve, reject) => {
				resolveClose = resolve
			})
		},
		dialogClose: (state, payload, store) => {
			state.dialogIsOpen = false
			if (resolveClose) resolveClose(payload)
			resolveClose = null
			store._update()
			//return true
		}
	},
	mutators: {
		setDialogIsOpen: (state, dialogIsOpen) => ({ dialogIsOpen }),
		setDialogOpen: (state, payload) => {
			const { title = "", text = "", labelOk = "Ok", labelCancel = null, modal = true, type = "info" } = payload
			return {
				dialogTitle: title,
				dialogText: text,
				dialogIsOpen: true,
				dialogLabelOk: labelOk,
				dialogLabelCancel: labelCancel,
				dialogModal: modal,
				dialogType: type
			}
		},
	},
}

export default dialog
