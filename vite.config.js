import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['src/tests/setup.ts'],
		alias: {
			// Ensure Svelte resolves to client-side bundle in tests
			svelte: 'svelte'
		},
		server: {
			deps: {
				inline: ['svelte']
			}
		}
	},
	resolve: {
		conditions: ['browser']
	}
});
