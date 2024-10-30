import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  UserType,
  ManagerType,
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

export const userReady = (props: Props) => {
  const {
    data,
    connectedScreens,
    connectedDevices,
    connectedUsers,
    ws,
    managers,
    connectingCount,
  } = props;

  const target = connectedUsers.find(
    (user) => user.data.uuid === data.body.uuid
  );

  if (data.body.type === "user" && target) {
    target.data = data.body;
    connectedScreens.forEach((screen) => {
      screen.ws.send(
        JSON.stringify({
          head: {
            type: "user_ready",
          },
          body: {
            user: data.body,
          },
        })
      );
    });
    connectedDevices.forEach((device) => {
      device.ws.send(
        JSON.stringify({
          head: {
            type: "user_ready",
          },
          body: {
            user: data.body,
          },
        })
      );
    });
    managers.forEach((manager) => {
      manager.ws.send(
        JSON.stringify({
          head: {
            type: "user_ready",
          },
          body: {
            user: data.body,
          },
        })
      );
    });
  }
};
