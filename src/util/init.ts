import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const init = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws } = props;

  if (data.body.type === "screen") {
    data.body.devices = connectedDevices.map((device) => device.data);
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
};
