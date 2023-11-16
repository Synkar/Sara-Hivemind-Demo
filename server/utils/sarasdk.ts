import type { H3Event, EventHandlerRequest } from "h3";
import { authToken } from "./authToken";
import { getCredentials } from "./getCredentials";
import { Sara } from "sara-sdk-ts";

export async function saraSession(event: H3Event<EventHandlerRequest>) {
  const token = await authToken(event);
  const credentials = await getCredentials(token);

  return await Sara.auth(credentials.appId, credentials.appSecret);
}

export async function HivemindInstance(event: H3Event<EventHandlerRequest>) {
  const session = await saraSession(event);

  const hivemind = new Sara.Hivemind(session);
  return hivemind;
}

export async function LocalityInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Localities();
}

export async function OperationInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Operations();
}

export async function RequestsInstance(event: H3Event<EventHandlerRequest>) {
  const hivemind = await HivemindInstance(event);

  return new hivemind.Requests();
}

export async function IAMInstance(event: H3Event<EventHandlerRequest>) {
  const session = await saraSession(event);

  const iam = new Sara.IAM(session);
  return iam;
}

export async function RobotsInstance(event: H3Event<EventHandlerRequest>) {
  const iam = await IAMInstance(event);

  return new iam.Robots();
}
