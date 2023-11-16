import startSocketServer from "./server/sockets";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    head: {
      title: "Hivemind Demo",
      link: [
        {
          rel: "icon",
          type: "image/png",
          href: "/hivemind.png",
        },
      ],
    },
  },
  ui: {
    global: true,
  },
  ssr: false,
  modules: ["@nuxt/ui", "@nuxtjs/i18n", "@pinia/nuxt"],
  i18n: {
    locales: ["en", "pt"],
    defaultLocale: "en",
    vueI18n: "./nuxt-i18n.ts",
  },
  css: [
    "~/assets/css/main.css",
    "@fortawesome/fontawesome-svg-core/styles.css",
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  hooks: {
    listen: (server) => startSocketServer(server),
  },
  runtimeConfig: {
    JWT_SECRET: process.env.JWT_SECRET || "secret-default",
    public: {
      BASE_URL: "https://sara.synkar.com/",
      AUTH_URL: "https://auth.sara.synkar.com/oauth2/token",
    },
  },
});
