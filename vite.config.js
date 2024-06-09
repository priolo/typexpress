import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';
import pkg from './package.json' assert { type: 'json' };


export default defineConfig({
	plugins: [
		dts(),
		//pluginExludeTests,
	],
	build: {
		sourcemap: true,
		lib: {
			entry: 'src/index.ts',
			name: 'typexpress',
			formats: ['es', "cjs"],
			fileName: (format) => `typexpress.${format}.js`,
		},
		rollupOptions: {
			external: [
				...Object.keys(pkg.dependencies), // non bundle dipendenze
				/^node:.*/, // non bundle moduli Node.js interni (utilizza importazioni di protocollo)
				"events", "fs", "path", "net", "http", "https", "url",
			],
		},
		target: 'esnext', // transpila il codice il meno possibile
	},
	resolve: {
		// Modifica la risoluzione predefinita per Node.js
		mainFields: ['module', 'jsnext:main', 'jsnext'],
		conditions: ['node'],
	},
	test: {
		globals: true,
		environment: 'node',
	},
})



const pluginExludeTests = {
	name: 'exclude-test-files',
	enforce: 'pre',
	resolveId(id) {
		if (id.endsWith('.test.ts') || id.endsWith('._test.ts') || id.endsWith('.spec.ts')) {
			return { id, external: true };
		}
	}
}