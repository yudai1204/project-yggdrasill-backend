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
  } else {
  }
};
