import { Server } from "socket.io";
import { defineNuxtModule } from "@nuxt/kit";
import { io } from "socket.io-client";
import { decodeToken } from "../server/utils/authToken";
import { getCredentials } from "../server/utils/getCredentials";
import { Sara } from "sara-sdk-ts";

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook("listen", (server, { host, port }) => {
      console.log(`ListeningHook : Listening on http://${host}:${port}`);
      const ioServer = new Server(server);

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
        const session = await Sara.auth(
          credentials.appId,
          credentials.appSecret
        );
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
    });
  },
});
