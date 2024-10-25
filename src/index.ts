import express from "express";
import { WebSocketServer } from "ws";
import type WebSocket from "ws";
import type {
  DeviceType,
  MessageType,
  ScreenType,
  StoredType,
} from "./util/types";
import { init } from "./util/init";
import { reconnect } from "./util/reconnect";
import { deviceUpdate } from "./util/deviceUpdate";
import { getDevices } from "./util/getDevices";

const app = express();
const PORT = process.env.PORT || 3210;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const connectedDevices: StoredType<DeviceType>[] = [];
const connectedScreens: StoredType<ScreenType>[] = [];

wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  // メッセージ受信時
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);

    try {
      const data = JSON.parse(message.toString()) as MessageType;
      // 初回接続処理
      if (data.head.type === "init") {
        console.log("初回接続: ", data.body.type);
        init({ data, connectedScreens, connectedDevices, ws });
      } else if (data.head.type === "reconnect") {
        console.log("再接続: ", data.body.type);
        reconnect({ data, connectedScreens, connectedDevices, ws });
      } else if (data.head.type === "devices_update") {
        console.log("デバイス情報更新", data.body.type);
        deviceUpdate({ data, connectedScreens, connectedDevices, ws });
      } else if (data.head.type === "get_devices") {
        console.log("デバイス情報取得: ", data.body.type);
        getDevices({ data, connectedScreens, connectedDevices, ws });
      } else {
        console.log("通常メッセージ: ", data.head.type);
      }
    } catch (error) {
      console.error("Error parsing JSON", error);
      return;
    }
  });
  ws.on("close", () => {
    console.log("Client disconnected");
    connectedDevices.forEach((device) => {
      if (device.ws === ws) {
        device.data.isConnected = false;
        connectedScreens.forEach((screen) => {
          screen.ws.send(
            JSON.stringify({
              head: { type: "devices_update" },
              body: connectedDevices.map((device) => device.data),
            })
          );
        });
      }
    });
  });
});
