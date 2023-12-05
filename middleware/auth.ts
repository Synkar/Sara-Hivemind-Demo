export default defineNuxtRouteMiddleware(async (to, from) => {
  const auth = useAuth();

  if (!auth.logged) {
    try {
      await auth.getMe();
      useAuth().login();
      return;
    } catch (e) {
      return navigateTo("/login");
    }
  }
});
