import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const reconnect = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws } = props;
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
      ws.send(JSON.stringify({ head: { type: "init" }, body: data.body }));
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
};
