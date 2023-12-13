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
  $development: {
    runtimeConfig: {
      public: {
        IS_SECURE: false,
        WS_HOST_PORT: process.env.WS_HOST_PORT || "localhost:3001",
        WS_PATH: process.env.WS_PATH || "/socket.io",
      },
    },
  },
  $production: {
    runtimeConfig: {
      public: {
        IS_SECURE: true,
        WS_HOST_PORT:
          process.env.WS_HOST_PORT || "https://dash-demo.sara.synkar.com",
        WS_PATH: process.env.WS_PATH || "/io/socket.io",
      },
    },
  },
  runtimeConfig: {
    JWT_SECRET: process.env.JWT_SECRET || "secret-default",
    public: {
      BASE_URL: "https://sara.synkar.com/",
      AUTH_URL: "https://auth.sara.synkar.com/oauth2/token",
      HOST: process.env.HOST || "http://localhost",
      WS_PORT: process.env.WS_PORT || "3001",
      WS_HOST_PORT:
        process.env.WS_HOST_PORT || "https://dash-demo.sara.synkar.com",
      WS_PATH: process.env.WS_PATH || "/io/socket.io",
    },
  },
  serverHandlers: [
    {
      route: "/ws",
      handler: "~/socket/ws",
    },
  ],
});
