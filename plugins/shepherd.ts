import { useShepherd } from "vue-shepherd";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(useShepherd);
});
