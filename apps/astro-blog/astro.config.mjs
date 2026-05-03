import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  outDir: '../dist/astro',
  base: '/astro',
  output: 'static',
  devToolbar: { enabled: false },
  server: {
    port: 4321,
  },
  integrations: [react()],
  // Astro 5: 使用 vite 插件进行 TypeScript 检查
  vite: {
    plugins: [],
  },
});
