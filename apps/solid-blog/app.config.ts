import { defineConfig } from '@solidjs/start/config';

export default defineConfig({
  server: {
    preset: 'static',
  },
  vite: {
    base: '/solid',
    build: {
      target: 'esnext',
    },
  },
});
