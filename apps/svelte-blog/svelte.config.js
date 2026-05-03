import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: '../dist/svelte',
      assets: '../dist/svelte',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
    alias: {
      '@': 'src',
      '@cf-blog/db': '../../packages/db/src',
    },
  },
};

export default config;
