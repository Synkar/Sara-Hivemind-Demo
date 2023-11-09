export default defineNuxtRouteMiddleware((to, from) => {
  if (!useAuth().logged) {
    const logged = useAuth().tryLogin();
    if (!logged) return navigateTo("/");
  }
});
