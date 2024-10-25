import express from "express";
import { WebSocketServer } from "ws";
import type WebSocket from "ws";

interface DeviceType {
  type: "user" | "device";
  uuid: string;
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  position: {
    x: number;
    y: number;
  };
  zoom: number;
  isConnected: boolean;
}

interface ScreenType {
  type: "screen";
  uuid: string;
  size: {
    width: number;
    height: number;
  };
  devices: DeviceType[];
}

interface MessageType {
  head: {
    type: string;
    index?: number;
  };
  body: ScreenType | DeviceType;
}

interface StoredType<T> {
  ws: WebSocket;
  data: T;
}

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
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);

    try {
      const data = JSON.parse(message.toString()) as MessageType;
      // 初回接続処理
      if (data.head.type === "init") {
        console.log("初回接続: ", data.body.type);

        if (data.body.type === "screen") {
          data.body.devices = connectedDevices.map((device) => device.data);
          connectedScreens.push({ ws, data: data.body });
          ws.send(JSON.stringify({ head: { type: "init" }, body: data.body }));
        } else if (data.body.type === "device") {
          connectedDevices.push({
            ws,
            data: { ...data.body, isConnected: true },
          });
          ws.send(
            JSON.stringify({
              head: { type: "init", index: connectedDevices.length - 1 },
              body: { ...data.body, isConnected: true },
            } as MessageType)
          );
          connectedScreens.forEach((screen) => {
            screen.ws.send(
              JSON.stringify({
                head: { type: "devices_update" },
                body: connectedDevices.map((device) => device.data),
              })
            );
          });
        } else {
        }
      } else if (data.head.type === "reconnect") {
        console.log("再接続: ", data.body.type);
        if (data.body.type === "screen") {
          const screen = connectedScreens.find(
            (screen) => screen.data.uuid === data.body.uuid
          );
          if (screen) {
            console.log("上書き処理");
            screen.ws = ws;
            screen.data = {
              ...data.body,
              devices: connectedDevices.map((device) => device.data),
            };
            return;
          } else {
            console.log("新規追加");
            data.body.devices = connectedDevices.map((device) => device.data);
            connectedScreens.push({ ws, data: data.body });
            ws.send(
              JSON.stringify({ head: { type: "init" }, body: data.body })
            );
          }
        } else if (data.body.type === "device") {
          const device = connectedDevices.find(
            (device) => device.data.uuid === data.body.uuid
          );
          if (device) {
            console.log("上書き処理");
            device.ws = ws;
            device.data = { ...data.body, isConnected: true };
          } else {
            console.log("新規追加");
            connectedDevices.push({
              ws,
              data: { ...data.body, isConnected: true },
            });
            ws.send(
              JSON.stringify({
                head: { type: "init", index: connectedDevices.length - 1 },
                body: { ...data.body, isConnected: true },
              } as MessageType)
            );
          }
          connectedScreens.forEach((screen) => {
            screen.ws.send(
              JSON.stringify({
                head: { type: "devices_update" },
                body: connectedDevices.map((device) => device.data),
              })
            );
          });
        }
      } else if (data.head.type === "devices_update") {
        console.log("デバイス情報更新", data.body.type);
        if (data.body.type === "screen") {
          const newDataBody = data.body as ScreenType;
          connectedDevices.forEach((device) => {
            const target = newDataBody.devices.find(
              (d) => d.uuid === device.data.uuid
            );
            if (target) {
              device.data = target;
              device.ws.send(
                JSON.stringify({
                  head: {
                    type: "devices_update",
                    index: connectedDevices.indexOf(device),
                  },
                  body: target,
                })
              );
            }
          });
          connectedScreens.forEach((screen) => {
            screen.ws.send(
              JSON.stringify({
                head: { type: "devices_update" },
                body: connectedDevices.map((device) => device.data),
              })
            );
          });
        }
      } else if (data.head.type === "get_devices") {
        console.log("デバイス情報取得: ", data.body.type);
        if (data.body.type === "screen") {
          ws.send(
            JSON.stringify({
              head: { type: "devices_update" },
              body: connectedDevices.map((device) => device.data),
            })
          );
        }
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
