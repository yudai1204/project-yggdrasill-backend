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

export const deviceUpdate = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws, managers } = props;
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
          head: {
            type: "devices_update",
            index: connectedScreens.indexOf(screen),
          },
          body: connectedDevices.map((device) => device.data),
        })
      );
    });
  } else if (data.body.type === "device") {
    const newDataBody = data.body as DeviceType;
    const target = connectedDevices.find(
      (device) => device.data.uuid === newDataBody.uuid
    );
    if (target) {
      target.data = newDataBody;
      connectedScreens.forEach((screen) => {
        screen.ws.send(
          JSON.stringify({
            head: {
              type: "devices_update",
              index: connectedDevices.indexOf(target),
            },
            body: connectedDevices.map((device) => device.data),
          })
        );
      });
    }
  }

  // manager以外で更新があったらmanagerに通知
  if (data.body.type !== "manager") {
    managers.forEach((manager) => {
      getAllData({ connectedScreens, connectedDevices, ws: manager.ws });
    });
  }
};
