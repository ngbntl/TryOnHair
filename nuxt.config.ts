export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL,
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT,
    },
  },

  vite: {
    server: {
      allowedHosts: ["tryonhair.onrender.com", "localhost"],
      cors: true,
    },
  },
});
