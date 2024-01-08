import type { H3Event, EventHandlerRequest } from "h3";
import { authToken } from "./authToken";
import { getCredentials } from "./getCredentials";
import { Sara } from "sara-sdk-ts";

/**
 * This file is a abstraction layer for the Sara SDK.
 * It's purpose is to provide a single point for all sdk instances.
 */

/**
 *
 * @param event H3Event
 * @returns Sara session
 * @description
 * This function is used to create a session with Sara.
 * It uses the authToken function to get the token from the event.
 * Then it uses the getCredentials function to get the app credentials.
 * Finally it uses the Sara.auth function to create the session.
 */
export async function saraSession(event: H3Event<EventHandlerRequest>) {
  const token = await authToken(event);
  const credentials = await getCredentials(token);

  return await Sara.auth(credentials.appId, credentials.appSecret);
}

/**
 *
 * @param event H3Event
 * @returns Sara Hivemind instance
 * @description
 * This function is used to create a Hivemind instance.
 * It uses the saraSession function to create a session.
 * Then it uses the Sara.Hivemind function to create the instance.
 * Finally it returns the instance.
 */
export async function HivemindInstance(event: H3Event<EventHandlerRequest>) {
  const session = await saraSession(event);

  const hivemind = new Sara.Hivemind(session);
  return hivemind;
}

/**
 *
 * @param event H3Event
 * @returns Sara Localities instance
 * @description
 * This function is used to create a Localities instance.
 * It uses the HivemindInstance function to create a Hivemind instance.
 * Then it uses the hivemind.Localities function to create the instance.
 * Finally it returns the instance.
 */
export async function LocalityInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Localities();
}

/**
 *
 * @param event H3Event
 * @returns Sara Operations instance
 * @description
 * This function is used to create a Operations instance.
 * It uses the HivemindInstance function to create a Hivemind instance.
 * Then it uses the hivemind.Operations function to create the instance.
 * Finally it returns the instance.
 */
export async function OperationInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Operations();
}

/**
 *
 * @param event H3Event
 * @returns Sara Requests instance
 * @description
 * This function is used to create a Requests instance.
 * It uses the HivemindInstance function to create a Hivemind instance.
 * Then it uses the hivemind.Requests function to create the instance.
 * Finally it returns the instance.
 */
export async function RequestsInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Requests();
}

/**
 *
 * @param event H3Event
 * @returns Sara IAM instance
 * @description
 * This function is used to create a IAM instance.
 * It uses the saraSession function to create a session.
 * Then it uses the Sara.IAM function to create the instance.
 * Finally it returns the instance.
 */
export async function IAMInstance(event: H3Event<EventHandlerRequest>) {
  const session = await saraSession(event);

  const iam = new Sara.IAM(session);
  return iam;
}

/**
 *
 * @param event H3Event
 * @returns Sara Robots instance
 * @description
 * This function is used to create a Robots instance.
 * It uses the IAMInstance function to create a IAM instance.
 * Then it uses the iam.Robots function to create the instance.
 * Finally it returns the instance.
 */
export async function RobotsInstance(event: H3Event<EventHandlerRequest>) {
  const iam = await IAMInstance(event);

  return new iam.Robots();
}
