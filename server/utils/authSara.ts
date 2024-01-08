import { Credentials } from "@prisma/client";
import { Axios } from "axios";

/**
 * The purpose of this file is to use Sara Services that is not available in the Sara SDK yet.
 */

export interface ISession {
  appId: string;
  appSecret: string;
  access_token?: string;
  scope?: string;
  attemps?: number;
  expires_in?: number;
  token_type?: string;
}

/**
 * @description
 * This class is used to create a session.
 * It uses the authSara function to create the session.
 * @example
 * const session = new Session({
 *  appId: "appId",
 *  appSecret: "appSecret",
 * });
 */
export class Session implements ISession {
  appId: string;
  appSecret: string;
  access_token?: string;
  scope?: string = "";
  attemps?: number = 0;
  expires_in?: number;
  token_type?: string;

  constructor(session: ISession) {
    this.appId = session.appId;
    this.appSecret = session.appSecret;
    this.access_token = session.access_token;
    this.scope = session.scope;
    this.attemps = session.attemps;
    this.expires_in = session.expires_in;
    this.token_type = session.token_type;
  }

  async refreshToken() {
    try {
      const response = await authSara(this);
      this.access_token = response.access_token;
      this.expires_in = response.expires_in;
      return response;
    } catch (e) {
      throw createError({
        statusCode: 401,
        message: "Error while refreshing token!",
      });
    }
  }
}

/**
 * @param session Session
 * @returns Session
 * @description
 * This function is used to authentificate the session.
 * It uses the axios to authentificate the session on aws cognito.
 * Then it returns the session with the access_token and secret_token.
 * It`s used by the auth function.
 */
export async function authSara(session: ISession) {
  const config = useRuntimeConfig();
  const axios = new Axios({
    baseURL: config.public.AUTH_URL as string,
  });

  const params = `?client_id=${session.appId}`;
  const body = `grant_type=client_credentials`;
  const auth = `${session.appId}:${session.appSecret}`;
  const agent = "Sara-Hivemind-Demo";

  try {
    const result = await axios.post(params, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": agent,
        "Accept-Language": "en-US",
        Authorization: `Basic ${Buffer.from(auth).toString("base64")}`,
      },
    });

    const data = JSON.parse(result.data);
    return new Session({
      ...session,
      ...data,
      expires_in: new Date().getTime() / 1000 + data.expires_in,
    });
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 401,
      message: "Error while trying to auth sara credentials",
    });
  }
}

/**
 * @param credentials Credentials
 * @returns Session
 * @description
 * This function is used to authentificate the credentials.
 * It uses the authSara function to authentificate the credentials.
 * Then it returns the session with the access_token and secret_token.
 * It`s used by the auth function.
 */
export async function auth(credentials: Credentials) {
  const session = new Session({
    appId: credentials.appId,
    appSecret: credentials.appSecret,
  });
  return await authSara(session);
}
