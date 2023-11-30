import { io as ioClient } from "socket.io-client";

export default function Svc(socket, io) {
  const { room } = socket.handshake.query;
  console.log(room);
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
  const socketClient = ioClient("https://sara.synkar.com", {
    path: "/v1/io",
    forceNew: true,
    reconnectionAttempts: 3,
    timeout: 10000,
    transports: ["websocket", "polling"],
    query: {
      room,
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
  socketClient.on("message", (message) => {
    socket.emit("message", message);
  });
  return Object.freeze({});
}
