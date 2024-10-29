import type WebSocket from "ws";
import type {
  MessageType,
  StoredType,
  ScreenType,
  DeviceType,
  ManagerType,
  UserType,
} from "./types";
import { getAllData } from "./getAllData";

type Props = {
  data: MessageType;
  connectedScreens: StoredType<ScreenType>[];
  connectedDevices: StoredType<DeviceType>[];
  connectedUsers: StoredType<UserType>[];
  managers: StoredType<ManagerType>[];
  ws: WebSocket;
  connectingCount: number;
};
export const resetToWaiting = (props: Props) => {
  const {
    data,
    connectedScreens,
    managers,
    connectedDevices,
    connectedUsers,
    ws,
    connectingCount,
  } = props;

  const json = JSON.stringify({
    head: {
      type: "reset_to_waiting",
    },
    body: {},
  });
  connectedScreens.forEach((screen) => {
    screen.ws.send(json);
  });
  connectedDevices.forEach((device) => {
    device.ws.send(json);
  });

  getAllData({
    connectedScreens,
    connectedDevices,
    connectedUsers,
    ws: ws,
    connectingCount,
  });
};
