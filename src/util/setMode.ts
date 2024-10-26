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
  mode: Mode;
  connectedDevices: StoredType<DeviceType>[];
  connectedScreens: StoredType<ScreenType>[];
  managers: StoredType<ManagerType>[];
};

export const setMode = (props: Props) => {
  const { mode, ws, connectedDevices, connectedScreens, managers } = props;
  console.log("モード変更: ", mode);

  connectedDevices.forEach((device) => {
    if (device.data.isConnected) {
      device.ws.send(
        JSON.stringify({
          head: {
            type: "setMode",
          },
          body: {
            mode: mode,
          },
        })
      );
    }
  });
  connectedScreens.forEach((screen) => {
    screen.ws.send(
      JSON.stringify({
        head: {
          type: "setMode",
        },
        body: {
          mode: mode,
        },
      })
    );
  });
  managers.forEach((manager) => {
    manager.ws.send(
      JSON.stringify({
        head: {
          type: "setMode",
        },
        body: {
          mode: mode,
        },
      })
    );
  });
};
