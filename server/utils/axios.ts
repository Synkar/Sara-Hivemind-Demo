import type { H3Event, EventHandlerRequest } from "h3";
import axios from "axios";
import { authToken } from "./authToken";
import { getCredentials } from "./getCredentials";
import { auth } from "./authSara";

/**
 * This file is a abstraction layer for axios.
 * It's purpose is to provide a single point for all axios instances.
 */

/**
 * @param event H3Event
 * @returns axios instance
 * @description
 * This function is used to create a axios instance.
 * It uses the authToken function to get the token from the event.
 * Then it uses the getCredentials function to get the app credentials.
 * Finally it returns the instance.
 * @example
 * const axiosInstance = await axiosHandler(event);
 * const response = await axiosInstance.get("/api/v1/users");
 * console.log(response.data);
 * @example
 * const axiosInstance = await axiosHandler(event);
 * const response = await axiosInstance.post("/api/v1/users", {
 *  username: "test",
 *  password: "test",
 * });
 * console.log(response.data);
 */
export async function axiosHandler(event: H3Event<EventHandlerRequest>) {
  const token = await authToken(event);
  const credentials = await getCredentials(token);
  const authorization = await auth(credentials);
  const config = useRuntimeConfig(event);

  const axiosInstance = axios.create({
    baseURL: config.public.BASE_URL,
    headers: {
      Authorization: `Bearer ${authorization.access_token}`,
    },
  });
  return axiosInstance;
}
