/* eslint eqeqeq: "off" */

import ajax from "../../plugin/AjaxService";


const store = {
	state: {
		item: null,
		all: null,
		itemInEdit: null,
	
		dialogIsOpen: false,
		dialogPassword2: "", // used in create new for confirm password 
	},
	getters: {
		getItemById: (state, id) => state.all.find(u => u.id == id),
		getItemIndexById: (state, id) => state.all.findIndex(u => u.id == id),
	},
	actions: {
		async fetchAll(state, payload, store) {
			const response = await ajax.get("users");
			store.setAll(response)
		},
		async save(state, item, store) {
			const response = item.id == null
				? await ajax.post("users", item)
				: await ajax.patch(`users/${item.id}`, item)
			store.setItemInAll(response)
		},
		async destroy(state, id, store) {
			if (id == null) throw new Error("invalid parameter")
			await ajax.delete(`users/${id}`);
			store.deleteItemInAll(id)
		},

		dialogOpen(state, id, store) {
			let user = id != null ? store.getItemById(id) : createUserLocally();
			store.setItemInEdit(user)
			store.setDialogIsOpen(true)
		},
		async dialogClose(state, toSave, store) {
			if (toSave) {
				try {
					await store.save(state.itemInEdit)
				} catch (e) {
					return
				}
			}
			store.setDialogIsOpen(false)
			store.setDialogPassword2("")
		},
	},
	mutators: {
		setAll: (state, payload) => ({ all: payload }),
		setItemInAll: (state, item, store) => {
			const index = store.getItemIndexById(item.id)
			const all = [...state.all]
			if (index == -1) {
				all.push(item)
			} else {
				all.splice(index, 1, item)
			}
			return { all }
		},
		deleteItemInAll: (state, id, store) => ({
			all: state.all.filter(i => i.id != id)
		}),
		setItemInEdit: (state, itemInEdit) => ({ itemInEdit }),
		setDialogIsOpen: (state, dialogIsOpen) => ({ dialogIsOpen }),
		setDialogPassword2: (state, dialogPassword2) => ({ dialogPassword2 }),
	},
}

const createUserLocally = () => ({
	id: null,
	username: "",
	password: "",
	role: 200,
})

export default store