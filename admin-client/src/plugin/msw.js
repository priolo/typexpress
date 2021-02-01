// start MSW (mock service worker)
// funziona SOLO quando il FE è servito in "localhost/"

if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_MOCK === 'true') {
	const { worker } = require('../mocks/ajax/browser')

	worker.start()

	// used in cypres
	window.getStoreAuth = ()=>{
		const { getStoreAuth } = require('../store/auth')
		return getStoreAuth();
	}
}

