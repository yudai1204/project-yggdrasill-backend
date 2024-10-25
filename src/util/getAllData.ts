import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const getAllData = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws } = props;

  ws.send(
    JSON.stringify({
      head: {
        type: "getAllData",
      },
      body: {
        screens: connectedScreens.map((screen) => screen.data),
        devices: connectedDevices.map((device) => device.data),
      },
    })
  );
};
