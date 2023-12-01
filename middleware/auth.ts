export default defineNuxtRouteMiddleware((to, from) => {
  if (!useAuth().logged) {
    const logged = useCookie("isLogged");
    const value = Boolean(logged.value);
    if (value) {
      useAuth().login();
      return;
    }
    return navigateTo("/");
  }
});
