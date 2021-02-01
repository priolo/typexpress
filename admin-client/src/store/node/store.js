/* eslint eqeqeq: "off" */

import ajax from "../../plugin/AjaxService";
import { getStoreLayout } from "../layout";


const store = {
	state: {
		// il nodo root 
		root: {},
		// nodo select
		select: {},

		actions: ["ACT1", "ACT2", "ACT3"],
		action: "",
		actionPayload: null,

	},
	getters: {
		
		isStateOpen(state, payload, store) {
			const { findDocByName } = getStoreLayout()
			return findDocByName("node-select-state")!=null
		}
	},
	actions: {
		async fetchRoot(state, payload, store) {
			const response = await ajax.get("node");
			store.setRoot(response)
		},
		async fetchById(state, id, store) {
			const response = await ajax.get(`node/${id}`)
			store.setSelect(response)
		},

		toggleStateOpen(state, payload, store) {
			const { findDocByName, addFormDoc, removeFromDoc, setFormRigthOpen } = getStoreLayout()
			const doc = findDocByName("node-select-state")
			if ( doc == null ) {
				addFormDoc({ 
					name: "node-select-state",
					title: "State:", 
					content: JSON.stringify(state.select.state, null, '\t'),
					type: "json",
					readonly: true
				})
				setFormRigthOpen(true)
			} else {
				removeFromDoc(doc.name)
			}
		},
		
	},
	mutators: {
		setRoot: (state, root) => ({ root }),
		setSelect: (state, select) => ({ select }),
		setIsStateOpen: (state, isStateOpen) => ({ isStateOpen }),
		setIsDispatchOpen: (state, isDispatchOpen) => ({ isDispatchOpen }),

		setAction:(state, action) => ({ action }),
		setActionPayload:(state, actionPayload) => ({ actionPayload }),
	},
}

export default store

