import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/fonts', '@nuxtjs/color-mode', 'shadcn-nuxt', '@nuxtjs/mdc', '@pinia/nuxt'],
  compatibilityDate: '2025-07-15',
  ssr: false,
  nitro: { preset: 'static' },
  devtools: { enabled: true },
  vite: {
    plugins: [tailwindcss()]
  }
})
