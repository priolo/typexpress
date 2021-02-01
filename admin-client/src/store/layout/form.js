/* eslint eqeqeq: "off" */

const form = {
	state: {
		formRigthOpen: false,
		formDocs: [],
	},
	getters: {
		getRigthOpen: ( state, payload, store ) => 
			state.formRigthOpen == true && state.formDocs?.length > 0,
		findDocByName: ( state, name, store ) => state.formDocs.find(d=>d.name==name),
	},
	actions: {
	},
	mutators: {
		addFormDoc: ( state, doc, store ) => ({ formDocs: [...state.formDocs, doc] }),
		removeFromDoc: ( state, name, store ) => ({ formDocs: state.formDocs.filter(d=>d.name!=name) }),
		setFormRigthOpen: (state, formRigthOpen, store ) => ({ formRigthOpen })
	},
}

export default form
