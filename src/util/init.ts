import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
} from "./types";
import { getAllData } from "./getAllData";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  managers: StoredType<ManagerType>[];
};

export const init = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws, managers } = props;

  if (data.body.type === "screen") {
    data.body.devices = connectedDevices.map((device) => device.data);
    data.body.connectedAt = new Date().getTime();
    connectedScreens.push({ ws, data: data.body });
    ws.send(
      JSON.stringify({
        head: {
          type: "init",
          index: connectedScreens.length - 1,
        },
        body: data.body,
      })
    );
  } else if (data.body.type === "device") {
    const newData = {
      ...data.body,
      isConnected: true,
      connectedAt: new Date().getTime(),
    };
    connectedDevices.push({
      ws,
      data: newData,
    });
    ws.send(
      JSON.stringify({
        head: { type: "init", index: connectedDevices.length - 1 },
        body: newData,
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
  } else if (data.body.type === "manager") {
    const target = managers.find((m) => m.data.uuid === data.body.uuid);
    const newData = {
      ...data.body,
      screens: connectedScreens.map((screen) => screen.data),
      devices: connectedDevices.map((device) => device.data),
    };
    if (target) {
      target.ws = ws;
      target.data = newData;
    } else {
      managers.push({ ws, data: newData });
    }
    getAllData({ connectedScreens, connectedDevices, ws });
  } else {
  }

  // manager以外で新規追加があったらmanagerに通知
  if (data.body.type !== "manager") {
    managers.forEach((manager) => {
      getAllData({ connectedScreens, connectedDevices, ws: manager.ws });
    });
  }
};
