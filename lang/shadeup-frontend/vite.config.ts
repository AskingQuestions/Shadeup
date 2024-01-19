import { defineConfig } from 'vite';
// import nodePolyfills from 'rollup-plugin-polyfill-node';
import dts from 'vite-plugin-dts';
// import nodeResolve from '@rollup/plugin-node-resolve';

export default defineConfig({
	esbuild: {
		keepNames: true
	},

	build: {
		lib: {
			entry: './src/index.ts',
			name: 'shadeup-frontend',
			fileName: 'shadeup-frontend'
		},
		target: 'esnext',
		sourcemap: false
	},
	resolve: {
		alias: {
			punycode: 'punycode/punycode.js'
			// '#ansi-styles': 'chalk/source/vendor/ansi-styles/index.js',
			// '#supports-color': 'chalk/source/vendor/supports-color/index.js'
		}
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				global: 'globalThis'
			}
		}
	},
	plugins: [dts()]
});
