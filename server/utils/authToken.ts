import { H3Event, EventHandlerRequest } from "h3";
import nJwt from "njwt";

export async function authToken(event: H3Event<EventHandlerRequest>) {
  const token = getCookie(event, "token");
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
      removeCookie(event);
      throw createError({
        statusCode: 500,
        message: "Something Strange Happened when try to decode token",
      });
    }
  } catch (e) {
    console.log(e);
    const error = e as Error;
    if (error.message === "EXPIRED") {
      const refreshToken = getCookie(event, "refreshToken");
      if (!refreshToken)
        throw createError({
          statusCode: 401,
          message: "No Token Provided!",
        });
      try {
        const verifiedJwt = nJwt.verify(refreshToken, config.JWT_SECRET);
        if (verifiedJwt && verifiedJwt.body) {
          const body = verifiedJwt.body.toJSON();
          const newToken = nJwt.create(
            {
              sub: body.sub,
            },
            config.JWT_SECRET
          );
          newToken.setExpiration(new Date().getTime() + 4 * 60 * 60 * 1000);
          addTokenCookie(event, newToken.compact());
          return body;
        } else {
          removeCookie(event);
          throw createError({
            statusCode: 500,
            message: "Something Strange Happened when try to decode token",
          });
        }
      } catch (e) {
        console.log(e);
        removeCookie(event);
        throw createError({
          statusCode: 401,
          message: "Invalid Token!",
        });
      }
    } else {
      removeCookie(event);
      throw createError({
        statusCode: 401,
        message: "Invalid Token!",
      });
    }
  }
}

export function removeCookie(event: H3Event<EventHandlerRequest>) {
  setCookie(event, "token", "", {
    httpOnly: true,
    secure: false, // TODO: Change to true when in fix https on production
    path: "/",
    sameSite: "strict",
  });
  setCookie(event, "isLogged", "false", {
    httpOnly: false,
    secure: false, // TODO: Change to true when in fix https on production
    path: "/",
    sameSite: "strict",
  });
}

export function addTokenCookie(
  event: H3Event<EventHandlerRequest>,
  token: string
) {
  setCookie(event, "token", token, {
    httpOnly: true,
    secure: false, // TODO: Change to true when in fix https on production
    path: "/",
    sameSite: "strict",
  });
  setCookie(event, "isLogged", "true", {
    httpOnly: false,
    secure: false, // TODO: Change to true when in fix https on production
    path: "/",
    sameSite: "strict",
  });
}

export function addRefreshTokenCookie(
  event: H3Event<EventHandlerRequest>,
  token: string
) {
  setCookie(event, "refreshToken", token, {
    httpOnly: true,
    secure: false, // TODO: Change to true when in fix https on production
    path: "/",
    sameSite: "strict",
  });
}

export async function decodeToken(token: string) {
  const JWT_SECRET = process.env.JWT_SECRET || "secret-default";
  try {
    const verifyJwt = nJwt.verify(token, JWT_SECRET);
    if (verifyJwt && verifyJwt.body) {
      return verifyJwt.body.toJSON();
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
