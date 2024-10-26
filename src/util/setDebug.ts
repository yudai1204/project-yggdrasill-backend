import type WebSocket from "ws";
import type {
  Mode,
  StoredType,
  DeviceType,
  ScreenType,
  ManagerType,
} from "./types";

type Props = {
  ws: WebSocket;
  isDebug: boolean;
  connectedDevices: StoredType<DeviceType>[];
  connectedScreens: StoredType<ScreenType>[];
  managers: StoredType<ManagerType>[];
};

export const setDebug = (props: Props) => {
  const { isDebug, ws, connectedDevices, connectedScreens, managers } = props;
  console.log("デバッグ切り替え: ", isDebug ? "ON" : "OFF");

  connectedDevices.forEach((device) => {
    if (device.data.isConnected) {
      device.ws.send(
        JSON.stringify({
          head: {
            type: "setDebug",
          },
          body: {
            debug: isDebug,
          },
        })
      );
    }
  });
  connectedScreens.forEach((screen) => {
    screen.ws.send(
      JSON.stringify({
        head: {
          type: "setDebug",
        },
        body: {
          debug: isDebug,
        },
      })
    );
  });
  managers.forEach((manager) => {
    manager.ws.send(
      JSON.stringify({
        head: {
          type: "setDebug",
        },
        body: {
          debug: isDebug,
        },
      })
    );
  });
};
