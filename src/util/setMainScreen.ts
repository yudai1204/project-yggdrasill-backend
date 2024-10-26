import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
} from "./types";

type Props = {
  data: MessageType;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  ws: WebSocket;
  managers: StoredType<ManagerType>[];
  setScreenSize: (width: number, height: number) => void;
};
export const setMainScreen = (props: Props) => {
  const {
    data,
    connectedScreens,
    connectedDevices,
    ws,
    managers,
    setScreenSize,
  } = props;
  if (data.body.type === "screen") {
    const newScreenSize = {
      width: data.body.size.width,
      height: data.body.size.height,
    };
    setScreenSize(data.body.size.width, data.body.size.height);
    connectedScreens.forEach((screen) => {
      screen.ws.send(
        JSON.stringify({
          head: {
            type: "setMainScreen",
          },
          body: newScreenSize,
        })
      );
      connectedDevices.forEach((device) => {
        device.ws.send(
          JSON.stringify({
            head: {
              type: "setMainScreen",
            },
            body: newScreenSize,
          })
        );
      });
      managers.forEach((manager) => {
        manager.ws.send(
          JSON.stringify({
            head: {
              type: "setMainScreen",
            },
            body: newScreenSize,
          })
        );
      });
    });
  }
};
