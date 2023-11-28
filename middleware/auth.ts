export default defineNuxtRouteMiddleware((to, from) => {
  if (!useAuth().logged) {
    const logged = useCookie("logged");
    const value = Boolean(logged.value);
    if (value) {
      useAuth().login();
      return;
    }
    return navigateTo("/");
  }
});
