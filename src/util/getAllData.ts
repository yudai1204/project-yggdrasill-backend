import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  UserType,
} from "./types";

type Props = {
  ws: WebSocket;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
};

export const getAllData = (props: Props) => {
  const { connectedScreens, connectedDevices, connectedUsers, ws } = props;

  ws.send(
    JSON.stringify({
      head: {
        type: "getAllData",
      },
      body: {
        screens: connectedScreens.map((screen) => screen.data),
        devices: connectedDevices.map((device) => device.data),
        users: connectedUsers.map((user) => user.data),
      },
    })
  );
};
