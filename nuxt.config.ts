// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          href: '/logo.svg',
          as: 'image',
          type: 'image/svg+xml'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:5000'
    }
  }
})