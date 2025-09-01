// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  srcDir: 'app',
  compatibilityDate: '2000-09-15',
  devtools: { enabled: true },
  devServer: {
    port: 3001
  },
  plugins: [
    '~/plugins/vee-validate.js',
  ],
  runtimeConfig: {
    public: {
      API: process.env.API,
    }
  }
})
