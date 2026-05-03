import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  server: {
    preset: 'static',
  },
  outDir: '../dist/solid',
  base: '/solid',
  vite: {
    build: {
      target: 'esnext',
    },
  },
});
