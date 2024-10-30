import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
  UserType,
} from "./types";

type Props = {
  data: MessageType;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
  managers: StoredType<ManagerType>[];
  ws: WebSocket;
  connectingCount: number;
};
export const animationStart = (props: Props) => {
  const {
    data,
    connectedScreens,
    managers,
    connectedDevices,
    connectedUsers,
    ws,
    connectingCount,
  } = props;
  if (data.body.type === "user") {
    const target = connectedUsers.find(
      (user) => user.data.uuid === data.body.uuid
    );
    if (!target) return;
    target.data = data.body;

    const json = JSON.stringify({
      head: {
        type: "animation_start",
      },
      body: data.body,
    });
    connectedScreens.forEach((screen) => {
      screen.ws.send(json);
    });
    connectedDevices.forEach((device) => {
      device.ws.send(json);
    });
    connectedUsers.forEach((user) => {
      user.ws.send(json);
    });

    managers.forEach((manager) => {
      manager.ws.send(json);
    });
  }
};
