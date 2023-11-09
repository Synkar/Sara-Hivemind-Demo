import { H3Event, EventHandlerRequest } from "h3";
import nJwt from "njwt";

export async function authToken(event: H3Event<EventHandlerRequest>) {
  const headers = event.headers;
  const token = headers.get("Authorization")?.split(" ")[1];
  const config = useRuntimeConfig(event);
  if (!token)
    throw createError({
      statusCode: 401,
      message: "No Token Provided!",
    });

  try {
    const verifiedJwt = nJwt.verify(token, config.JWT_SECRET);
    if (verifiedJwt && verifiedJwt.body) {
      const body = verifiedJwt.body.toJSON();

      return body;
    } else {
      throw createError({
        statusCode: 500,
        message: "Something Strange Happened when try to decode token",
      });
    }
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 401,
      message: "Invalid Token!",
    });
  }
}
