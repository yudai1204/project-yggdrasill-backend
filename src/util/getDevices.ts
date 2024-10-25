import type WebSocket from "ws";
import type { MessageType, StoredType, ScreenType, DeviceType } from "./types";

type Props = {
  data: MessageType;
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
};

export const getDevices = (props: Props) => {
  const { data, connectedScreens, connectedDevices, ws } = props;
  if (data.body.type === "screen") {
    ws.send(
      JSON.stringify({
        head: {
          type: "devices_update",
          index: connectedScreens.findIndex(
            (s) => s.data.uuid === data.body.uuid
          ),
        },
        body: connectedDevices.map((device) => device.data),
      })
    );
  }
};
