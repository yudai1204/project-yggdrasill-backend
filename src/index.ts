import express from "express";
import { WebSocketServer } from "ws";
import type WebSocket from "ws";
import type {
  DeviceType,
  MessageType,
  ScreenType,
  StoredType,
  ManagerType,
  Mode,
} from "./util/types";
import { init } from "./util/init";
import { reconnect } from "./util/reconnect";
import { deviceUpdate } from "./util/deviceUpdate";
import { getDevices } from "./util/getDevices";
import { getAllData } from "./util/getAllData";
import { onDisconnected } from "./util/onDisconnected";
import { setMode } from "./util/setMode";
import { screenUpdate } from "./util/screenUpdate";
import { setDebug } from "./util/setDebug";

const app = express();
const PORT = process.env.PORT || 3210;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const connectedDevices: StoredType<DeviceType>[] = [];
const connectedScreens: StoredType<ScreenType>[] = [];
const managers: StoredType<ManagerType>[] = [];

let mode: Mode = "Calibration";
let isDebug: boolean = true;

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
        init({ data, connectedScreens, connectedDevices, ws, managers });
      } else if (data.head.type === "reconnect") {
        console.log("再接続: ", data.body.type);
        reconnect({ data, connectedScreens, connectedDevices, ws, managers });
      } else if (data.head.type === "devices_update") {
        console.log("デバイス情報更新", data.body.type);
        deviceUpdate({
          data,
          connectedScreens,
          connectedDevices,
          ws,
          managers,
        });
      } else if (data.head.type === "screens_update") {
        console.log("スクリーン情報更新", data.body.type);
        screenUpdate({
          data,
          connectedScreens,
          connectedDevices,
          ws,
          managers,
        });
      } else if (data.head.type === "get_devices") {
        console.log("デバイス情報取得: ", data.body.type);
        getDevices({ data, connectedScreens, connectedDevices, ws });
      } else if (data.head.type === "getAllData") {
        console.log("全データ取得");
        getAllData({ connectedScreens, connectedDevices, ws });
      } else if (data.head.type === "setDebug") {
        setDebug({
          ws,
          connectedDevices,
          connectedScreens,
          managers,
          // @ts-ignore
          isDebug: data.body.debug,
        });
        // @ts-ignore
        isDebug = data.body.debug;
      } else if (data.head.type === "setMode") {
        setMode({
          // @ts-ignore
          mode: data.body.mode,
          ws,
          connectedDevices,
          connectedScreens,
          managers,
        });
        // @ts-ignore
        mode = data.body.mode;
      } else if (data.head.type === "getCurrentSettings") {
        ws.send(
          JSON.stringify({
            head: { type: "getCurrentSettings" },
            body: { mode, debug: isDebug },
          })
        );
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
    onDisconnected({ connectedScreens, connectedDevices, ws, managers });
  });
});
