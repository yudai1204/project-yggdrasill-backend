import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const deviceUpdate = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws } = props;
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
};
