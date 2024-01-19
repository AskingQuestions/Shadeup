import { defineConfig } from 'vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import wasm from 'vite-plugin-wasm';
// const prefix = `monaco-editor/esm/vs`;
import { sveltekit } from '@sveltejs/kit/vite';
import nodeResolve from '@rollup/plugin-node-resolve';
import createExternal from 'vite-plugin-external';
export default defineConfig({
	plugins: [
		wasm(),
		nodeResolve(),
		createExternal({
			externals: {
				typescript: 'typescript',
				chalk: 'chalk',
				'@typescript/vfs': '@typescript/vfs'
			}
		})
	],
	build: {
		commonjsOptions: {
			transformMixedEsModules: true
		},
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: './compiler/simple.ts',
			name: 'ShadeupCompiler',
			// the proper extensions will be added
			fileName: 'shadeup-compiler'
		},
		outDir: '../../../compiler-api/',
		sourcemap: false
	},
	esbuild: {
		keepNames: false
	},
	resolve: {
		alias: {
			src: '/src',
			punycode: 'punycode/punycode.js',
			'/std_math': '../shadeup-frontend/lib/std/math.ts'
		}
	},
	worker: {
		format: 'es',
		plugins: [wasm()]
	},
	optimizeDeps: {
		esbuildOptions: {
			define: {
				self: 'globalThis',
				global: 'globalThis'
			},
			plugins: [
				NodeGlobalsPolyfillPlugin({
					process: true,
					buffer: true
				})
			]
		}
	},
	server: {
		fs: {
			// Allow serving files from one level up to the project root
			allow: ['..']
		}
	}
});
