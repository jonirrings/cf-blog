import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

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
    plugins: [tailwindcss()],
  },
});
