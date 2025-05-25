// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  // Cấu hình runtime config để sử dụng biến môi trường
  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT,
    },
  },
});
