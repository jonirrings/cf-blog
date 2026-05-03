// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-01-01',
  devtools: { enabled: false },
  ssr: false,

  nitro: {
    output: {
      publicDir: '../dist/nuxt',
    },
  },

  typescript: {
    tsConfig: {
      compilerOptions: {
        paths: {
          '@/*': ['./*'],
          '@cf-blog/db': ['../../packages/db/src'],
        },
      },
    },
  },

  app: {
    head: {
      title: 'Blog - Nuxt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A blog powered by Cloudflare' },
      ],
    },
  },

  modules: ['@nuxtjs/tailwindcss'],
});
