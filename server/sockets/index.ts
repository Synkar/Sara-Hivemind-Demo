import { Server as NuxtServer } from "node:http";
import { Socket, Server } from "socket.io";
import { io } from "socket.io-client";
import { decodeToken } from "../utils/authToken";
import { getCredentials } from "../utils/getCredentials";
import { Sara } from "sara-sdk-ts";

export default (nuxtServer: NuxtServer) => {
  const ioServer = new Server(nuxtServer);
  ioServer.on("connection", async (socket: Socket) => {
    const { token, room } = socket.handshake.query;
    const decodedToken = await decodeToken(token as string);
    const credentials = await getCredentials(decodedToken);
    const session = await Sara.auth(credentials.appId, credentials.appSecret);
    const socketClient = io("https://sara.synkar.com", {
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
      console.log("Connected Client!");
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
};
