import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { BrowserRouter as Router } from "react-router-dom";
import { setupStore, MultiStoreProvider } from '@priolo/iistore';
//import { MultiStoreProvider } from '@priolo/iistore/src/lib/store/rvxProviders';

import './plugin/i18n';
//import './plugin/msw';

import auth from "./store/auth/store"
import layout from "./store/layout/store"
import user from "./store/user/store"
import node from "./store/node/store"

setupStore({ auth, layout, user, node })

function Base() {
	return (
		<MultiStoreProvider>
			<Router>
				<App />
			</Router>
		</MultiStoreProvider>
	)
}

ReactDOM.render(<Base />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
//serviceWorker.register();

if (module.hot) {
	module.hot.accept();
}