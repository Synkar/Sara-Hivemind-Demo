import { removeCookie } from "../utils/authToken";

export default defineEventHandler(async (event) => {
  removeCookie(event);
  return {
    message: "Logout Success",
  };
});
