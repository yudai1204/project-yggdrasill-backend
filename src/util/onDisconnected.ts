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
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  managers: StoredType<ManagerType>[];
};

export const onDisconnected = (props: Props) => {
  const { ws, connectedScreens, connectedDevices, managers } = props;
  managers.forEach((manager) => {
    if (manager.ws === ws) {
      managers.splice(managers.indexOf(manager), 1);
    }
  });

  connectedDevices.forEach((device) => {
    if (device.ws === ws) {
      device.data.isConnected = false;
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
      // managerに通知
      managers.forEach((manager) => {
        getAllData({ connectedScreens, connectedDevices, ws: manager.ws });
      });
    }
  });
  connectedScreens.forEach((screen) => {
    if (screen.ws === ws) {
      console.log("connectedScreens: ", connectedScreens.length);
      connectedScreens.forEach((s) => {
        s.ws.send(
          JSON.stringify({
            head: {
              type: "devices_update",
              index: connectedScreens.indexOf(s),
            },
            body: connectedDevices.map((device) => device.data),
          })
        );
      });
      // managerに通知
      managers.forEach((manager) => {
        getAllData({ connectedScreens, connectedDevices, ws: manager.ws });
      });
    }
  });
};
