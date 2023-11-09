import type { H3Event, EventHandlerRequest } from "h3";
import axios from "axios";
import { authToken } from "./authToken";
import { getCredentials } from "./getCredentials";
import { auth } from "./authSara";

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
