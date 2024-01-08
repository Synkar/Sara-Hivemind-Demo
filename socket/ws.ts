import { Server } from "socket.io";
import { io } from "socket.io-client";
import { decodeToken } from "../server/utils/authToken";
import { getCredentials } from "../server/utils/getCredentials";
import { Sara } from "sara-sdk-ts";

/**
 * This file is where the socket.io server is created.
 * It's purpose is to provide a bridge between the Sara.IO and the Frontend.
 * By Running on the server it can use the Sara SDK to create a session.
 * Then it can use the session to connect to Sara.IO.
 * Finally it can use the Sara.IO to send and receive messages.
 * The Token is received via Cookie.
 * @example
 * const socket = io("http://localhost:3000", {
 *  path: "/v1/io",
 *  forceNew: true,
 *  reconnectionAttempts: 3,
 *  timeout: 10000,
 *  transports: ["websocket", "polling"],
 *  query: {
 *    room: "room",
 *  },
 */

const config = useRuntimeConfig();

const ioServer = new Server(Number(config.public.WS_PORT), {
  cors: {
    origin: "*",
  },
});

ioServer.on("connection", async (socket) => {
  const { room } = socket.handshake.query;
  const cookies = socket.handshake.headers.cookie?.split(";");
  const token = cookies
    ?.find((cookie) => cookie.includes("token"))
    ?.split("=")[1];
  if (!token)
    return socket.emit("message", {
      action: "ERROR",
      data: "Invalid Token!",
      issuer: socket.id,
      service: "hivemind",
    });
  const decodedToken = await decodeToken(token);
  const credentials = await getCredentials(decodedToken);
  const session = await Sara.auth(credentials.appId, credentials.appSecret);
  const socketClient = io(config.public.BASE_URL, {
    path: "/v1/io",
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    transports: ["websocket", "polling"],
    query: {
      room,
      token: session.access_token,
    },
  });
  socketClient.on("connect", () => {
    socket.emit("message", {
      action: "CONNECTED",
      data: "Connected To Sara.IO",
      issuer: socket.id,
      service: "hivemind",
    });
    console.log("Connected to Sara.IO!");
  });
  socketClient.on("disconnect", () => {
    console.log("Disconnected Client!");
  });
  socketClient.on("error", (error) => {
    console.log("Error Client" + error);
  });
  socketClient.on("message", (message) => {
    socket.emit("message", message);
  });
});

ioServer.on("error", (error) => {
  console.log("Error Server" + error);
});

/**
 * @param event H3Event
 * @returns H3Response
 * @description
 * This function is used to be called by nuxt server
 * Then when called just return a 200 status code.
 * And instantiate the socket.io server.
 */
export default eventHandler(async (_event) => {
  return {
    statusCode: 200,
    body: "Hello World",
  };
});
