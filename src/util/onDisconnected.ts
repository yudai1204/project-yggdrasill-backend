import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const onDisconnected = (props: Props) => {
  const { ws, connectedScreens, connectedDevices } = props;

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
    }
  });
  connectedScreens.forEach((screen) => {
    if (screen.ws === ws) {
      connectedScreens.splice(connectedScreens.indexOf(screen), 1);
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
    }
  });
};
